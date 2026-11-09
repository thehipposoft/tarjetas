"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { useFlipCard } from "@/components/flip-card";
import styles from "./obsidian.module.css";

/**
 * "Premium dynamic lighting" for the Obsidian card.
 *
 * `LightingRoot` wraps BOTH faces of the flip card, so the front and the QR
 * back share one light. Phone tilt (DeviceOrientationEvent) — or the mouse
 * on desktop — writes five custom properties on it, inherited by both faces:
 *
 *   --light-x / --light-y   reflection centre, in %
 *   --light-intensity       0.6 at rest → 1 at full tilt
 *   --lx / --ly             the same position, unitless −1…1, for offsets
 *
 * Values are written straight to `style` inside a requestAnimationFrame loop
 * (eased towards the latest sensor target, stopping once settled), so sensor
 * events never cause a React render. Nothing about the sensor is stored or
 * sent anywhere. On iOS the sensor unlocks on the visitor's first tap (see
 * below). With prefers-reduced-motion, without a sensor, or if
 * permission is refused, the CSS defaults give the static lighting design.
 */

type PermissionResult = "granted" | "denied";
type PermissionState = "idle" | "granted" | "denied";
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

export function LightingRoot({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canAskPermission = useSyncExternalStore(
    subscribeToMotionPreference,
    sensorNeedsPermission,
    () => false
  );
  const [permission, setPermission] = useState<PermissionState>("idle");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

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
      const s = root.style;
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
        root.style.removeProperty(prop);
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

  // iOS only allows the sensor-permission prompt inside a user gesture, so
  // there is no button: the first tap anywhere on the page asks (the
  // request must start synchronously inside that touch handler). Other
  // platforms never get here — their sensor works without asking.
  useEffect(() => {
    if (!canAskPermission || permission !== "idle") return;
    const onFirstTouch = () => {
      const request = orientationCtor()?.requestPermission?.();
      if (!request) return;
      request
        .then((result) =>
          setPermission(result === "granted" ? "granted" : "denied")
        )
        .catch(() => setPermission("denied"));
    };
    window.addEventListener("touchend", onFirstTouch, { once: true });
    return () => window.removeEventListener("touchend", onFirstTouch);
  }, [canAskPermission, permission]);

  return (
    <div ref={rootRef} className={styles.lightRoot}>
      {children}
    </div>
  );
}

/** Small QR icon that flips the card — swiping sideways does the same. */
export function FlipToQrButton() {
  const { toggleFlip } = useFlipCard();
  return (
    <button
      type="button"
      onClick={toggleFlip}
      className={`${styles.cornerButton} ${styles.cornerLeft}`}
      aria-label="Mostrar código QR del contacto"
      title="Código QR"
    >
      <span className={styles.cornerRing}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2v2h-2zM18 18h2v2h-2zM18 14h2M14 18v2" />
        </svg>
      </span>
    </button>
  );
}

/** One face of the card: graphite bands, moving light and red accents. */
export function ObsidianFace({ children }: { children: ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.bands} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentTop}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentTopFaint}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentBottom}`} aria-hidden="true" />
      <span className={`${styles.accent} ${styles.accentBottomFaint}`} aria-hidden="true" />
      {children}
    </div>
  );
}
