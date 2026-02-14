"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReduceMotion } from "@/components/ReduceMotionProvider";

const CHARS =
  "!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

interface DecryptAnimationProps {
  lines: string[];
  onComplete?: () => void;
  speed?: number; // ms between lines, default 150
}

export function DecryptAnimation({
  lines,
  onComplete,
  speed = 150,
}: DecryptAnimationProps) {
  const { reduceMotion } = useReduceMotion();
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const mountedRef = useRef(true);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    mountedRef.current = true;
    completedRef.current = false;

    if (reduceMotion) {
      setVisibleLines(lines);
      handleComplete();
      return;
    }

    let lineIndex = 0;

    const showNextLine = () => {
      if (!mountedRef.current || lineIndex >= lines.length) {
        if (mountedRef.current) handleComplete();
        return;
      }

      const finalText = lines[lineIndex];
      let frame = 0;
      const maxFrames = 10;

      const scramble = () => {
        if (!mountedRef.current) return;
        frame++;

        if (frame > maxFrames) {
          setVisibleLines((prev) => {
            const next = [...prev];
            next[lineIndex] = finalText;
            return next;
          });
          lineIndex++;
          setTimeout(showNextLine, speed);
          return;
        }

        const scrambled = finalText
          .split("")
          .map((char, j) =>
            j < (frame / maxFrames) * finalText.length
              ? char
              : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join("");

        setVisibleLines((prev) => {
          const next = [...prev];
          next[lineIndex] = scrambled;
          return next;
        });

        requestAnimationFrame(scramble);
      };

      setVisibleLines((prev) => [...prev, ""]);
      requestAnimationFrame(scramble);
    };

    showNextLine();

    return () => {
      mountedRef.current = false;
    };
  }, [reduceMotion, lines, speed, handleComplete]);

  return (
    <div
      className="w-full bg-black/50 border border-border rounded-lg p-4 font-mono text-xs space-y-1"
      aria-live="polite"
      aria-label="Decrypting data"
    >
      {visibleLines.map((line, i) => (
        <div
          key={i}
          className={
            i < visibleLines.length - 1 ? "text-neon" : "text-text-muted"
          }
        >
          <span className="text-text-muted mr-2">{">"}</span>
          {line}
        </div>
      ))}
    </div>
  );
}
