type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "accent";

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-card text-text-secondary",
  success: "bg-status-success/15 text-status-success",
  warning: "bg-status-warning/15 text-status-warning",
  error: "bg-status-error/15 text-status-error",
  info: "bg-status-info/15 text-status-info",
  accent: "bg-accent/15 text-accent",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
