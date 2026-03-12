type SkeletonVariant = "text" | "circle" | "rectangle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded",
  circle: "h-12 w-12 rounded-full",
  rectangle: "h-24 w-full rounded-md",
};

export function Skeleton({ variant = "text", className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-foreground/10 ${variantClasses[variant]} ${className}`}
    />
  );
}
