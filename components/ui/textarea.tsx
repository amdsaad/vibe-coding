import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-md border bg-transparent px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        error ? "border-red-500" : "border-foreground/20"
      } ${className}`}
      {...props}
    />
  );
}
