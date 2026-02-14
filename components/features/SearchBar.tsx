"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Read searchParams once per call via a ref to avoid re-render loops
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const debouncedNavigate = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(
          searchParamsRef.current.toString()
        );
        if (value.trim()) {
          params.set("q", value.trim());
        } else {
          params.delete("q");
        }
        params.delete("page"); // reset page on new search
        router.replace(`/search?${params.toString()}`);
      }, 300);
    },
    [router]
  );

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedNavigate(value);
    },
    [debouncedNavigate]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const params = new URLSearchParams(
        searchParamsRef.current.toString()
      );
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.replace(`/search?${params.toString()}`);
    },
    [query, router]
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
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search items... (telur, beras, minyak)"
          className="w-full h-10 pl-9 pr-9 rounded-md bg-surface border border-border text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon"
          aria-label="Search grocery items"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => handleChange("")}
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
