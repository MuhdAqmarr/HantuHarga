"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallHint() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("hh-install-dismissed")) {
      setDismissed(true);
      return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
      return;
    }

    // Detect iOS (no beforeinstallprompt support)
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    if (isiOS) {
      setIsIos(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem("hh-install-dismissed", "1");
  }, []);

  // Show nothing if dismissed or no prompt available (and not iOS)
  if (dismissed || (!deferredPrompt && !isIos)) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-40 flex justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-neon/30 rounded-lg p-3 shadow-lg shadow-neon/5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0">
          <Download size={16} className="text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs text-text-primary">
            Install HargaHantu
          </div>
          {isIos ? (
            <p className="text-[10px] text-text-muted truncate">
              Tap Share → &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <p className="text-[10px] text-text-muted">
              Add to home screen for quick access
            </p>
          )}
        </div>
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="shrink-0 h-8 px-3 rounded-md font-mono text-xs bg-neon text-background hover:bg-neon/90 active:scale-95 transition-all"
          >
            Install
          </button>
        ) : null}
        <button
          onClick={handleDismiss}
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Dismiss install hint"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
