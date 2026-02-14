import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Build the href for a given page number */
  buildHref: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between pt-4 pb-2">
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider border border-border text-text-secondary hover:border-neon hover:text-neon transition-colors"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Prev
        </Link>
      ) : (
        <span />
      )}

      <span className="font-mono text-[10px] text-text-muted">
        {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider border border-border text-text-secondary hover:border-neon hover:text-neon transition-colors"
        >
          Next
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
