"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScanLayout } from "@/components/layout/ScanLayout";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useReduceMotion } from "@/components/ReduceMotionProvider";

const DECRYPT_LINES = [
  "INITIALIZING PRICE INTELLIGENCE...",
  "SCANNING MERCHANT DATABASE...",
  "EXTRACTING LINE ITEMS...",
  "CROSS-REFERENCING CANONICAL ITEMS...",
  "COMPUTING PRICE PERCENTILES...",
  "CLASSIFICATION COMPLETE.",
];

const CHARS =
  "!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export default function ProcessPage() {
  const router = useRouter();
  const { reduceMotion } = useReduceMotion();
  const [status, setStatus] = useState<
    "animating" | "extracting" | "done" | "error"
  >("animating");
  const [errorMsg, setErrorMsg] = useState("");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const mountedRef = useRef(true);

  const runExtraction = useCallback(async () => {
    setStatus("extracting");

    const imageData = sessionStorage.getItem("hh-cropped-image") || sessionStorage.getItem("hh-pending-image");
    if (!imageData) {
      router.replace("/scan");
      return;
    }

    try {
      // Convert data URL to blob
      const res = await fetch(imageData);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("file", blob, "receipt.jpg");
      formData.append("area", "Kuala Lumpur");

      const response = await fetch("/api/receipt/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Extraction failed");
      }

      const data = await response.json();
      sessionStorage.setItem("hh-extraction", JSON.stringify(data));
      setStatus("done");
      router.push("/scan/review");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }, [router]);

  // Animate decrypt lines
  useEffect(() => {
    mountedRef.current = true;

    if (reduceMotion) {
      // Skip animation, show all lines immediately
      setVisibleLines(DECRYPT_LINES);
      runExtraction();
      return;
    }

    let lineIndex = 0;
    const showNextLine = () => {
      if (!mountedRef.current || lineIndex >= DECRYPT_LINES.length) {
        if (mountedRef.current) runExtraction();
        return;
      }

      const finalText = DECRYPT_LINES[lineIndex];
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
          setTimeout(showNextLine, 150);
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
  }, [reduceMotion, runExtraction]);

  return (
    <ScanLayout title="DECRYPTING" step={3}>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Terminal output */}
        <div
          className="w-full max-w-sm bg-black/50 border border-border rounded-lg p-4 font-mono text-xs space-y-1"
          aria-live="polite"
          aria-label="Processing receipt"
        >
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className={
                i < visibleLines.length - 1 || status !== "animating"
                  ? "text-neon"
                  : "text-text-muted"
              }
            >
              <span className="text-text-muted mr-2">{">"}</span>
              {line}
            </div>
          ))}

          {status === "extracting" && (
            <div className="text-orange-bright animate-pulse">
              <span className="text-text-muted mr-2">{">"}</span>
              AWAITING AI RESPONSE...
            </div>
          )}
        </div>

        {/* Scanline effect */}
        {status === "extracting" && !reduceMotion && (
          <div className="w-full max-w-sm h-0.5 bg-neon/30 mt-4 overflow-hidden rounded">
            <div className="h-full w-1/3 bg-neon animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="mt-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-orange">
              <AlertTriangle size={16} />
              <span className="font-mono text-sm">DECRYPTION FAILED</span>
            </div>
            <p className="text-text-secondary text-xs max-w-xs">{errorMsg}</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/scan")}
              >
                Retake Photo
              </Button>
              <Button
                variant="neon"
                size="sm"
                onClick={() => {
                  setStatus("animating");
                  setVisibleLines([]);
                  setErrorMsg("");
                }}
              >
                <RefreshCw size={14} aria-hidden="true" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScanLayout>
  );
}
