"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import styles from "./obsidian.module.css";

/**
 * The card's outer surface plus its "premium dynamic lighting".
 *
 * Phone tilt (DeviceOrientationEvent) — or the mouse on desktop — moves a
 * soft reflection across the graphite bands, the glass contact buttons and
 * the metallic edges of the business rows. All of that is plain CSS reading
 * five custom properties on this element:
 *
 *   --light-x / --light-y   reflection centre, in %
 *   --light-intensity       0.6 at rest → 1 at full tilt
 *   --lx / --ly             the same position, unitless −1…1, for offsets
 *
 * Values are written straight to `style` inside a requestAnimationFrame loop
 * (eased towards the latest sensor target, stopping once settled), so sensor
 * events never cause a React render. Nothing about the sensor is stored or
 * sent anywhere. With prefers-reduced-motion, without a sensor, or if
 * permission is refused, the CSS defaults give the static lighting design.
 */

type PermissionResult = "granted" | "denied";
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionResult>;
};

const MAX_TILT_DEG = 22; // tilt (either axis) that maps to the edge of travel
const EASE = 0.09; // per-frame smoothing towards the target
const REST_INTENSITY = 0.6;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function orientationCtor(): OrientationEventWithPermission | undefined {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window
    ? (window.DeviceOrientationEvent as OrientationEventWithPermission)
    : undefined;
}

/** iOS Safari: the sensor is there but needs a user gesture to unlock. */
function sensorNeedsPermission(): boolean {
  if (window.matchMedia(REDUCED_MOTION).matches) return false;
  if (window.matchMedia(FINE_POINTER).matches) return false;
  return typeof orientationCtor()?.requestPermission === "function";
}

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ObsidianSurface({ children }: { children: ReactNode }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canAskPermission = useSyncExternalStore(
    subscribeToMotionPreference,
    sensorNeedsPermission,
    () => false
  );
  const [permission, setPermission] = useState<
    "idle" | "granted" | "denied"
  >("idle");

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    const finePointer = window.matchMedia(FINE_POINTER);
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let baseBeta: number | null = null;
    let teardown: Array<() => void> = [];

    const write = () => {
      const { x, y } = current;
      const tilt = Math.min(1, Math.hypot(x, y) / Math.SQRT2);
      const s = surface.style;
      s.setProperty("--light-x", `${(50 + x * 34).toFixed(2)}%`);
      s.setProperty("--light-y", `${(28 + y * 26).toFixed(2)}%`);
      s.setProperty(
        "--light-intensity",
        (REST_INTENSITY + (1 - REST_INTENSITY) * tilt).toFixed(3)
      );
      s.setProperty("--lx", x.toFixed(3));
      s.setProperty("--ly", y.toFixed(3));
    };

    const tick = () => {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      write();
      const settled =
        Math.abs(target.x - current.x) < 0.002 &&
        Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const aim = (x: number, y: number) => {
      target.x = clamp(x);
      target.y = clamp(y);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      let gamma = event.gamma; // left/right
      let beta = event.beta; // front/back
      const angle = screen.orientation?.angle ?? 0;
      if (angle === 90) [gamma, beta] = [beta, -gamma];
      else if (angle === 270 || angle === -90) [gamma, beta] = [-beta, gamma];

      // Treat however the phone is being held as "level", and drift towards
      // it slowly so the reflection re-centres after a change of grip.
      if (baseBeta === null) baseBeta = beta;
      baseBeta += (beta - baseBeta) * 0.004;

      // A reflection slides opposite to the tilt, like light on glass.
      aim(-gamma / MAX_TILT_DEG, -(beta - baseBeta) / MAX_TILT_DEG);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aim(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1
      );
    };

    const listen = <K extends keyof WindowEventMap>(
      type: K,
      handler: (event: WindowEventMap[K]) => void
    ) => {
      window.addEventListener(type, handler, { passive: true });
      teardown.push(() => window.removeEventListener(type, handler));
    };

    const stop = () => {
      teardown.forEach((off) => off());
      teardown = [];
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      target.x = target.y = current.x = current.y = 0;
      baseBeta = null;
      for (const prop of [
        "--light-x",
        "--light-y",
        "--light-intensity",
        "--lx",
        "--ly",
      ]) {
        surface.style.removeProperty(prop);
      }
    };

    const start = () => {
      stop();
      if (reducedMotion.matches) return; // keep the static lighting

      if (finePointer.matches) {
        listen("pointermove", onPointerMove);
        return;
      }

      const Orientation = orientationCtor();
      if (!Orientation) return;
      const gated = typeof Orientation.requestPermission === "function";
      if (!gated || permission === "granted") {
        listen("deviceorientation", onOrientation);
      }
    };

    start();
    reducedMotion.addEventListener("change", start);
    finePointer.addEventListener("change", start);

    return () => {
      reducedMotion.removeEventListener("change", start);
      finePointer.removeEventListener("change", start);
      stop();
    };
  }, [permission]);

  async function enableLighting() {
    try {
      const result = await orientationCtor()?.requestPermission?.();
      setPermission(result === "granted" ? "granted" : "denied");
    } catch {
      setPermission("denied");
    }
  }

  return (
    <div ref={surfaceRef} className={styles.card}>
      <div className={styles.bands} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentTop}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentTopFaint}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentBottom}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentBottomFaint}`} aria-hidden="true" />

      {canAskPermission && permission === "idle" && (
        <button
          type="button"
          onClick={enableLighting}
          className={styles.lightToggle}
          aria-label="Activar iluminación dinámica"
          title="Activar iluminación dinámica"
        >
          <span className={styles.lightToggleRing}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
            </svg>
          </span>
        </button>
      )}

      {children}
    </div>
  );
}
