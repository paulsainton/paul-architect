interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = "bg-accent", label, className = "" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-secondary">{label}</span>
          <span className="text-xs font-mono text-text-muted">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-bg-card overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
