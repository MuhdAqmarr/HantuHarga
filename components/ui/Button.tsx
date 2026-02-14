import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono text-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-neon focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        neon: "bg-neon text-background border border-neon hover:bg-neon/90 active:scale-95",
        ghost:
          "bg-transparent text-text-primary border border-border hover:border-border-bright active:scale-95",
        outline:
          "bg-transparent text-neon border border-neon hover:bg-neon/10 active:scale-95",
        danger:
          "bg-transparent text-orange border border-orange hover:bg-orange/10 active:scale-95",
      },
      size: {
        sm: "h-8 px-3 rounded-sm text-xs",
        md: "h-10 px-4 rounded-md",
        lg: "h-12 px-6 rounded-md text-base",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
