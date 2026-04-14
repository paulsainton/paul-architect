import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const baseClasses =
  "w-full rounded-lg bg-bg-surface border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = "", ...props }, ref) => (
  <label className="block">
    {label && <span className="block text-xs text-text-secondary mb-1.5">{label}</span>}
    <input ref={ref} className={`${baseClasses} ${className}`} {...props} />
  </label>
));
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, className = "", ...props }, ref) => (
  <label className="block">
    {label && <span className="block text-xs text-text-secondary mb-1.5">{label}</span>}
    <textarea ref={ref} className={`${baseClasses} min-h-[80px] resize-y ${className}`} {...props} />
  </label>
));
Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, options, className = "", ...props }, ref) => (
  <label className="block">
    {label && <span className="block text-xs text-text-secondary mb-1.5">{label}</span>}
    <select ref={ref} className={`${baseClasses} ${className}`} {...(props as Record<string, unknown>)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </label>
));
Select.displayName = "Select";
