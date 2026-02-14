"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ProgressSteps } from "@/components/features/ProgressSteps";

interface ScanLayoutProps {
  title: string;
  step: number;
  totalSteps?: number;
  children: React.ReactNode;
}

export function ScanLayout({
  title,
  step,
  totalSteps = 4,
  children,
}: ScanLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border">
        <h1 className="font-mono text-sm text-neon uppercase tracking-wider">
          {title}
        </h1>
        <button
          onClick={() => router.push("/scan")}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary transition-colors"
          aria-label="Exit scan"
        >
          <X size={18} />
        </button>
      </header>
      <ProgressSteps current={step} total={totalSteps} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
