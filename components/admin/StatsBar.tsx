"use client";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  doneThisWeek: number;
}

export function StatsBar({ stats }: { stats: Stats }) {
  const items = [
    { label: "סה\"כ בקשות", value: stats.total, color: "bg-accent-light text-accent-dark" },
    { label: "ממתינות", value: stats.pending, color: "bg-amber-50 text-status-pending" },
    { label: "בטיפול", value: stats.inProgress, color: "bg-blue-50 text-status-in-progress" },
    { label: "הושלמו השבוע", value: stats.doneThisWeek, color: "bg-emerald-50 text-status-done" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl p-4 text-center ${item.color}`}
        >
          <div className="text-3xl font-bold font-heading">{item.value}</div>
          <div className="text-sm mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
