"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { ITEM_CATEGORIES } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  eggs: "🥚",
  rice: "🍚",
  oil: "🛢️",
  chicken: "🍗",
  milk: "🥛",
  instant_noodles: "🍜",
  bread: "🍞",
  beverages: "☕",
  snacks: "🍿",
  household: "🏠",
  vegetables: "🥬",
  fruits: "🍎",
  seafood: "🐟",
  condiments: "🧂",
  other: "📦",
};

function formatLabel(cat: string): string {
  return cat.replace(/_/g, " ");
}

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "";

  // Drag-to-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 3) hasDragged.current = true;
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }, []);

  const handleSelect = useCallback(
    (category: string) => {
      if (hasDragged.current) return; // suppress click after drag
      const params = new URLSearchParams(searchParams.toString());
      if (category === active) {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams, active]
  );

  const handleClear = useCallback(() => {
    if (hasDragged.current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 cursor-grab select-none"
      role="tablist"
      aria-label="Filter by category"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="flex gap-2 w-max">
        {/* All pill */}
        <button
          role="tab"
          aria-selected={!active}
          onClick={handleClear}
          className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all whitespace-nowrap ${
            !active
              ? "bg-neon text-background border-neon"
              : "bg-transparent text-text-secondary border-border hover:border-border-bright"
          }`}
        >
          All
        </button>

        {ITEM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            onClick={() => handleSelect(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all whitespace-nowrap ${
              active === cat
                ? "bg-neon text-background border-neon"
                : "bg-transparent text-text-secondary border-border hover:border-border-bright"
            }`}
          >
            {CATEGORY_EMOJI[cat] || "📦"} {formatLabel(cat)}
          </button>
        ))}
      </div>
    </div>
  );
}
