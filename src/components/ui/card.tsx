import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  selected?: boolean;
}

export function Card({ hover, selected, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-bg-card p-4 transition-colors ${
        selected ? "border-accent bg-bg-card-hover" : "border-border"
      } ${hover ? "hover:bg-bg-card-hover hover:border-border-hover cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
