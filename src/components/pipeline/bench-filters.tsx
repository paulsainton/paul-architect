"use client";

import { Input, Select } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Filters {
  category: string;
  subcategory: string;
  sector: string;
  style: string;
  device: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CATEGORIES = [
  { value: "", label: "Toutes cat\u00e9gories" },
  { value: "BENCH UI", label: "BENCH UI" },
  { value: "BENCH DEV", label: "BENCH DEV" },
  { value: "BENCH PUB", label: "BENCH PUB" },
  { value: "A TESTER", label: "A TESTER" },
];

const SUBCATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "maquette-web", label: "Maquette web" },
  { value: "maquette-mobile", label: "Maquette mobile" },
  { value: "ui-kit", label: "UI Kit" },
  { value: "inspiration", label: "Inspiration" },
  { value: "landing", label: "Landing page" },
  { value: "dashboard", label: "Dashboard" },
];

const SECTORS = [
  { value: "", label: "Tous secteurs" },
  { value: "finance", label: "Finance" },
  { value: "ecom", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "food", label: "Food" },
  { value: "health", label: "Sant\u00e9" },
  { value: "education", label: "\u00c9ducation" },
  { value: "travel", label: "Voyage" },
];

const STYLES = [
  { value: "", label: "Tous styles" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "minimalist", label: "Minimaliste" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "bold", label: "Bold" },
  { value: "gradient", label: "Gradient" },
];

const DEVICES = [
  { value: "", label: "Tous devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
  { value: "responsive", label: "Responsive" },
];

export function BenchFilters({ filters, onChange }: Props) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <Select options={CATEGORIES} value={filters.category} onChange={(e) => update("category", (e.target as HTMLSelectElement).value)} />
      <Select options={SUBCATEGORIES} value={filters.subcategory} onChange={(e) => update("subcategory", (e.target as HTMLSelectElement).value)} />
      <Select options={SECTORS} value={filters.sector} onChange={(e) => update("sector", (e.target as HTMLSelectElement).value)} />
      <Select options={STYLES} value={filters.style} onChange={(e) => update("style", (e.target as HTMLSelectElement).value)} />
      <Select options={DEVICES} value={filters.device} onChange={(e) => update("device", (e.target as HTMLSelectElement).value)} />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <Input
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Recherche..."
          className="pl-8"
        />
      </div>
    </div>
  );
}
