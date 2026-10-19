"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface CrosshairCursorProps {
  verticalColor?: string;
  verticalThickness?: number;
  horizontalColor?: string;
  horizontalThickness?: number;
  dotColor?: string;
  dotSize?: number;
  dotDisabled?: boolean;
  showPosition?: boolean;
  labelMode?: "position" | "custom";
  labelText?: string;
  labelFont?: CSSProperties;
  labelColor?: string;
  labelBg?: string;
  labelPaddingX?: number;
  labelPaddingY?: number;
  labelRadius?: number;
  /** Fade in/out duration in seconds. Pass 0 to disable the fade. */
  fadeDuration?: number;
}

export default function CrosshairCursor({
  verticalColor = "white",
  verticalThickness = 1,
  horizontalColor = "white",
  horizontalThickness = 1,
  dotDisabled = false,
  dotColor = "#19FA2F",
  dotSize = 12,
  showPosition = true,
  labelMode = "position",
  labelText = "Aim",
  labelFont = {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "1.5em",
    letterSpacing: "0em",
    textAlign: "left",
  },
  labelColor = "#000000",
  labelBg = "#ffffff",
  labelPaddingX = 6,
  labelPaddingY = 4,
  labelRadius = 1,
  fadeDuration = 0.2,
}: CrosshairCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const positionTextRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Position updates bypass React entirely: pointer events are coalesced into
  // one requestAnimationFrame write of compositor-only transforms, so moving
  // the cursor never re-renders or forces layout. React state only changes
  // when the crosshair is shown or hidden.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rect = container.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    let frame = 0;

    const measure = () => {
      rect = container.getBoundingClientRect();
    };

    const render = () => {
      frame = 0;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setIsVisible(x >= 0 && x <= rect.width && y >= 0 && y <= rect.height);

      if (verticalRef.current) verticalRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      if (horizontalRef.current) horizontalRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (labelRef.current) labelRef.current.style.transform = `translate3d(${x + 12}px, ${y + 12}px, 0)`;
      if (positionTextRef.current) {
        positionTextRef.current.textContent = `X: ${Math.round(x)}  Y: ${Math.round(y)}`;
      }
    };

    const schedule = (x: number, y: number) => {
      clientX = x;
      clientY = y;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const handleMouseMove = (ev: MouseEvent) => schedule(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) schedule(touch.clientX, touch.clientY);
    };
    // Pointer left the browser window — hide rather than freeze at the edge.
    const handleWindowLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    document.documentElement.addEventListener("mouseleave", handleWindowLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, { capture: true });
      document.documentElement.removeEventListener("mouseleave", handleWindowLeave);
    };
  }, []);

  const layer: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    willChange: "transform",
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${fadeDuration}s ease-in-out`,
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        zIndex: 2147483647,
        cursor: "none",
      }}
    >
      <div
        ref={verticalRef}
        style={{
          ...layer,
          height: "100vh",
          width: verticalThickness,
          marginLeft: -verticalThickness / 2,
          backgroundColor: verticalColor,
        }}
      />
      <div
        ref={horizontalRef}
        style={{
          ...layer,
          width: "100vw",
          height: horizontalThickness,
          marginTop: -horizontalThickness / 2,
          backgroundColor: horizontalColor,
        }}
      />
      {dotDisabled ? null : (
        <div
          ref={dotRef}
          style={{
            ...layer,
            width: dotSize,
            height: dotSize,
            marginLeft: -dotSize / 2,
            marginTop: -dotSize / 2,
            borderRadius: "100%",
            backgroundColor: dotColor,
          }}
        />
      )}
      {showPosition && (
        <div
          ref={labelRef}
          style={{
            ...layer,
            lineHeight: 1,
            ...labelFont,
            color: labelColor,
            background: labelBg,
            padding: `${labelPaddingY}px ${labelPaddingX}px`,
            borderRadius: labelRadius,
            whiteSpace: "nowrap",
          }}
        >
          {labelMode === "custom" ? labelText : <span ref={positionTextRef} />}
        </div>
      )}
    </div>
  );
}
