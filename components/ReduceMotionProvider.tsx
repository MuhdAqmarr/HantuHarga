"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface ReduceMotionContextType {
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
}

const ReduceMotionContext = createContext<ReduceMotionContextType>({
  reduceMotion: false,
  toggleReduceMotion: () => {},
});

export function useReduceMotion() {
  return useContext(ReduceMotionContext);
}

export function ReduceMotionProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hh-reduce-motion");
    if (stored !== null) {
      setReduceMotion(stored === "true");
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotion((prev) => {
      const next = !prev;
      localStorage.setItem("hh-reduce-motion", String(next));
      return next;
    });
  }, []);

  return (
    <ReduceMotionContext.Provider value={{ reduceMotion, toggleReduceMotion }}>
      {children}
    </ReduceMotionContext.Provider>
  );
}
