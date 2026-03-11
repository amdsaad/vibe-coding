import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-foreground/10 bg-background p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
