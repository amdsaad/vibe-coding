interface BadgeProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Badge({ children, onRemove, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-xs font-mono text-foreground ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-foreground/20 transition-colors"
          aria-label="Remove"
        >
          &times;
        </button>
      )}
    </span>
  );
}
