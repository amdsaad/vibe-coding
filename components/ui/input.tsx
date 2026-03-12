import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-transparent px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
          error ? "border-red-500" : "border-foreground/20"
        } ${className}`}
        {...props}
      />
    );
  }
);
