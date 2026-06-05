export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "brand" | "secondary" | "outline";
  className?: string;
}) {
  const styles = {
    default: "bg-background text-muted ring-border",
    success: "bg-success/10 text-success ring-success/20",
    warning: "bg-warning/10 text-warning ring-warning/20",
    error: "bg-error/10 text-error ring-error/20",
    brand: "bg-brand-light text-brand ring-brand/20",
    secondary: "bg-surface text-foreground ring-border",
    outline: "bg-transparent text-muted ring-border",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
