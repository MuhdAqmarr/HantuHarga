"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReduceMotion } from "@/components/ReduceMotionProvider";

const PriceConstellation = dynamic(
  () =>
    import("@/components/three/PriceConstellation").then(
      (mod) => mod.PriceConstellation
    ),
  { ssr: false }
);

export function LazyConstellation() {
  const { reduceMotion } = useReduceMotion();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Don't render if reduced motion is preferred
    if (reduceMotion) return;

    // Don't render on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
      return;

    // Check Save-Data header via connection API
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    // Defer loading until idle
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setShouldRender(true), {
        timeout: 3000,
      });
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => setShouldRender(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [reduceMotion]);

  if (!shouldRender) return null;

  return (
    <div
      className="absolute inset-0 opacity-0 animate-[fadeIn_2s_ease-in_forwards]"
      aria-hidden="true"
    >
      <PriceConstellation />
    </div>
  );
}
