"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim().length < 1) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", query.trim());
      router.push(`/search?${params.toString()}`);
    },
    [query, searchParams, router]
  );

  return (
    <form onSubmit={handleSubmit} role="search" className="px-4 py-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items... (telur, beras, minyak)"
          className="w-full h-10 pl-9 pr-3 rounded-md bg-surface border border-border text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon"
          aria-label="Search grocery items"
        />
      </div>
    </form>
  );
}
