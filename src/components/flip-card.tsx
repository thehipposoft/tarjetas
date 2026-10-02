"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";

const DRAG_START_PX = 8;
const FLIP_PROGRESS = 0.2;
const FLIP_VELOCITY_PX_PER_MS = 0.5;

type Gesture = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastT: number;
  velocity: number;
  dragging: boolean;
};

/**
 * Lets a custom `back` face (see tomas-borigen) call back into FlipCard's
 * own flip state without FlipCard having to accept a function prop — a
 * Server Component parent can't pass plain functions to a Client Component,
 * only serializable props and JSX, so "give the back face a callback" has
 * to go through context rather than a prop.
 */
const FlipCardContext = createContext<{ toggleFlip: () => void } | null>(
  null
);

export function useFlipCard() {
  const ctx = useContext(FlipCardContext);
  if (!ctx) throw new Error("useFlipCard must be used inside a FlipCard");
  return ctx;
}

/** Copy-to-clipboard state, shared by the default back face and any custom `back` content that wants the same "Copiar enlace" / "¡Enlace copiado!" behavior. */
export function useCopyLink(url: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return { copied, copyLink };
}

/**
 * Wraps a profile card so a horizontal swipe (touch or mouse drag) flips it
 * over to reveal a shareable QR code for the page's own URL. The card follows
 * the finger while dragging and snaps to the nearest face on release; vertical
 * gestures are left alone so inner scroll regions keep working.
 *
 * `children` (the front face) should fill its parent (`h-full w-full`) — this component owns the
 * card's outer size (`max-w-107.5`, `max-h-184`).
 */
export function FlipCard({
  children,
  qrSvg,
  url,
  title,
  primaryColor,
  back,
}: {
  children: ReactNode;
  qrSvg: string;
  url: string;
  title: string;
  primaryColor: string;
  /**
   * Custom back-face content, replacing the default white card — for a page
   * with its own fixed palette (see tomas-borigen's navy/gold) where the
   * default white-card-with-brand-border back would clash. A plain
   * `ReactNode` (not a render-prop function: this component gets rendered
   * from Server Component pages, which can pass JSX/Client Component
   * elements as props but not functions) — build it with `useFlipCard()`
   * (for the "Volver" button) and `useCopyLink()` (for "Copiar enlace"),
   * the same hooks the default back face below uses, so behavior never
   * drifts between the two.
   */
  back?: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // Resting rotation of the card: always 0 (front) or 180 (back).
  const restingAngleRef = useRef(0);
  const gestureRef = useRef<Gesture | null>(null);
  const justDraggedRef = useRef(false);
  const [flipped, setFlipped] = useState(false);
  const { copied, copyLink } = useCopyLink(url);

  useEffect(() => {
    const inner = innerRef.current;
    return () => {
      if (inner) gsap.killTweensOf(inner);
    };
  }, []);

  function toggleFlip() {
    flipTo(restingAngleRef.current === 0 ? 180 : 0);
  }

  function flipTo(target: number) {
    const inner = innerRef.current;
    if (!inner) return;
    const resting = ((target % 360) + 360) % 360;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setFlipped(resting === 180);
    gsap.to(inner, {
      rotationY: target,
      duration: reduceMotion ? 0 : 0.6,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        restingAngleRef.current = resting;
        gsap.set(inner, { rotationY: resting });
      },
    });
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const inner = innerRef.current;
    if (!inner || gsap.isTweening(inner)) return;
    gestureRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      dragging: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = gestureRef.current;
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!g || g.id !== e.pointerId || !root || !inner) return;

    const dx = e.clientX - g.startX;
    if (!g.dragging) {
      const dy = e.clientY - g.startY;
      if (Math.abs(dy) > DRAG_START_PX && Math.abs(dy) > Math.abs(dx)) {
        gestureRef.current = null;
        return;
      }
      if (Math.abs(dx) < DRAG_START_PX) return;
      g.dragging = true;
      root.setPointerCapture(e.pointerId);
      root.style.userSelect = "none";
    }

    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.velocity = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;

    const progress = Math.max(-1, Math.min(1, dx / root.clientWidth));
    gsap.set(inner, { rotationY: restingAngleRef.current + progress * 180 });
  }

  function endGesture(e: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const g = gestureRef.current;
    const root = rootRef.current;
    if (!g || g.id !== e.pointerId || !root) return;
    gestureRef.current = null;
    if (!g.dragging) return;

    if (root.hasPointerCapture(e.pointerId)) {
      root.releasePointerCapture(e.pointerId);
    }
    root.style.userSelect = "";
    // A drag that ends over a link would otherwise also "click" it.
    justDraggedRef.current = true;
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 0);

    const dx = e.clientX - g.startX;
    const direction = Math.sign(dx);
    const swipedFar = Math.abs(dx / root.clientWidth) > FLIP_PROGRESS;
    const flungFast =
      Math.abs(g.velocity) > FLIP_VELOCITY_PX_PER_MS &&
      Math.sign(g.velocity) === direction &&
      Math.abs(dx) > 30;
    const shouldFlip = !cancelled && (swipedFar || flungFast);

    flipTo(restingAngleRef.current + (shouldFlip ? direction * 180 : 0));
  }

  return (
    <FlipCardContext.Provider value={{ toggleFlip }}>
      <div
        ref={rootRef}
        className="perspective-distant relative mx-auto h-full max-h-184 w-full max-w-107.5 touch-pan-y **:touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endGesture(e, false)}
        onPointerCancel={(e) => endGesture(e, true)}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (justDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div ref={innerRef} className="transform-3d relative h-full w-full">
          <div className="backface-hidden absolute inset-0" inert={flipped}>
            {children}
          </div>

          <div
            className="backface-hidden rotate-y-180 absolute inset-0"
            inert={!flipped}
          >
            {back ?? (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-4xl border-2 bg-white px-6 text-center shadow-xl"
                style={{ borderColor: primaryColor }}
              >
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                    Compartí esta tarjeta
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-neutral-900">
                    {title}
                  </h2>
                  <span
                    className="mt-2 inline-block h-0.5 w-8"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                <div
                  className="aspect-square w-64 max-w-full rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-neutral-500">
                    Escaneá el código para abrirla
                  </p>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-live="polite"
                    className="text-sm text-neutral-700 underline underline-offset-2"
                  >
                    {copied ? "¡Enlace copiado!" : "Copiar enlace"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleFlip}
                  className="rounded-full border-2 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors active:bg-neutral-100"
                  style={{ borderColor: primaryColor }}
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </FlipCardContext.Provider>
  );
}
