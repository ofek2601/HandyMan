"use client";

import { WORK_TYPES } from "@/lib/validations";

const STATUS_TABS = [
  { value: "all", label: "הכל" },
  { value: "pending", label: "ממתין" },
  { value: "in_progress", label: "בטיפול" },
  { value: "done", label: "הושלם" },
  { value: "cancelled", label: "בוטל" },
] as const;

interface FilterBarProps {
  status: string;
  workType: string;
  sort: string;
  onStatusChange: (status: string) => void;
  onWorkTypeChange: (workType: string) => void;
  onSortChange: (sort: string) => void;
}

export function FilterBar({
  status,
  workType,
  sort,
  onStatusChange,
  onWorkTypeChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] ${
              status === tab.value
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary border border-border hover:bg-accent-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Work type + sort */}
      <div className="flex gap-3">
        <select
          value={workType}
          onChange={(e) => onWorkTypeChange(e.target.value)}
          className="flex-1 rounded-[10px] border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent min-h-[40px]"
        >
          <option value="">כל סוגי העבודה</option>
          {WORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={() => onSortChange(sort === "newest" ? "oldest" : "newest")}
          className="rounded-[10px] border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-accent-light min-h-[40px] whitespace-nowrap"
        >
          {sort === "newest" ? "חדש ← ישן" : "ישן ← חדש"}
        </button>
      </div>
    </div>
  );
}
