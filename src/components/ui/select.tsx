import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, id, options, className = "", ...props }, ref) {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-velvet-200"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          className={`focus-ring rounded-lg border bg-velvet-800 px-3 py-2 text-sm text-velvet-50 transition-colors appearance-none ${
            error ? "border-loss" : "border-velvet-700"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-loss"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
