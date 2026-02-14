import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neon" | "orange" | "muted";
  className?: string;
}

const variants = {
  neon: "bg-neon/10 text-neon border-neon/30",
  orange: "bg-orange/10 text-orange-bright border-orange/30",
  muted: "bg-surface-elevated text-text-secondary border-border",
};

export function Badge({
  children,
  variant = "muted",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
