import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "border border-border bg-secondary text-secondary-foreground hover:border-primary/40 hover:bg-accent focus-visible:ring-primary",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-primary",
  icon:
    "size-9 border border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:ring-primary",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}