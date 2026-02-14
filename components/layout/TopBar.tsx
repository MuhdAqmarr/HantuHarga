"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

export function TopBar({ title, showBack = false }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center h-12 px-4 max-w-lg mx-auto">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mr-3 h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="font-mono text-sm text-neon uppercase tracking-wider truncate">
          {title}
        </h1>
      </div>
    </header>
  );
}
