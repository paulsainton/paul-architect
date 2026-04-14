"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className = "" }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? "bg-accent border-accent" : "bg-transparent border-border hover:border-border-hover"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
