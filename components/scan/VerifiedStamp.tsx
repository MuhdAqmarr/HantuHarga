"use client";

import { useEffect, useRef, useState } from "react";
import { useReduceMotion } from "@/components/ReduceMotionProvider";

interface VerifiedStampProps {
  text?: string;
  onComplete?: () => void;
}

export function VerifiedStamp({
  text = "VERIFIED",
  onComplete,
}: VerifiedStampProps) {
  const stampRef = useRef<HTMLDivElement>(null);
  const { reduceMotion } = useReduceMotion();
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      onComplete?.();
      return;
    }

    let cancelled = false;

    const animate = async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !stampRef.current) return;

      setVisible(true);

      gsap.fromTo(
        stampRef.current,
        {
          scale: 3,
          rotation: -15,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2)",
          onComplete: () => {
            if (!cancelled) onComplete?.();
          },
        }
      );
    };

    // Small delay for visual effect
    const timer = setTimeout(animate, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reduceMotion, onComplete]);

  return (
    <div
      ref={stampRef}
      className="inline-flex items-center justify-center"
      style={{ opacity: visible ? 1 : 0 }}
      role="img"
      aria-label={`${text} stamp`}
    >
      <div className="relative border-4 border-neon rounded-lg px-6 py-3 rotate-[-3deg]">
        <div className="font-mono text-2xl font-bold text-neon tracking-[0.2em]">
          {text}
        </div>
        <div className="absolute inset-0 rounded-lg bg-neon/5" />
      </div>
    </div>
  );
}
