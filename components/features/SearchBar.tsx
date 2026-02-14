"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const navigate = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      navigate(query);
    },
    [query, navigate]
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
          className="w-full h-10 pl-9 pr-9 rounded-md bg-surface border border-border text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon"
          aria-label="Search grocery items"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
