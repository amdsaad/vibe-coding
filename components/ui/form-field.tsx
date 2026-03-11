interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-mono font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm font-mono text-red-500">{error}</p>
      )}
    </div>
  );
}
