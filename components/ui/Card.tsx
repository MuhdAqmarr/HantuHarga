import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        glow && "border-neon/20 shadow-[0_0_15px_rgba(0,255,136,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
