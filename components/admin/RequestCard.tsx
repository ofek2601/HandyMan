"use client";

import { useState } from "react";
import type { Request } from "@/db/schema";

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין",
  in_progress: "בטיפול",
  done: "הושלם",
  cancelled: "בוטל",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-status-pending",
  in_progress: "bg-blue-100 text-status-in-progress",
  done: "bg-emerald-100 text-status-done",
  cancelled: "bg-gray-100 text-status-cancelled",
};

const TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  pending: [
    { value: "in_progress", label: "העבר לטיפול" },
    { value: "cancelled", label: "בטל" },
  ],
  in_progress: [
    { value: "done", label: "סמן כהושלם" },
    { value: "cancelled", label: "בטל" },
  ],
};

interface RequestCardProps {
  request: Request;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onNotesChange: (id: string, notes: string) => Promise<void>;
  onPhotoClick: (url: string) => void;
}

export function RequestCard({
  request,
  onStatusChange,
  onNotesChange,
  onPhotoClick,
}: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(request.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const photoUrls: string[] = request.photoUrls
    ? JSON.parse(request.photoUrls)
    : [];

  const transitions = TRANSITIONS[request.status] || [];

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      await onStatusChange(request.id, newStatus);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleNotesSave = async () => {
    if (notes === (request.adminNotes || "")) return;
    setSaving(true);
    try {
      await onNotesChange(request.id, notes);
    } finally {
      setSaving(false);
    }
  };

  const date = new Date(request.createdAt + "Z");
  const formattedDate = date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg">{request.name}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[request.status]}`}
            >
              {STATUS_LABELS[request.status]}
            </span>
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {request.workType}
          </div>
          <div className="text-xs text-text-secondary mt-0.5">
            {formattedDate}
          </div>
        </div>
        <span className="text-text-secondary text-lg mt-1">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {/* Contact info */}
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">טלפון: </span>
              <a
                href={`tel:${request.phone}`}
                className="text-status-in-progress underline"
                dir="ltr"
              >
                {request.phone}
              </a>
            </div>
            <div>
              <span className="font-medium">כתובת: </span>
              {request.address}
            </div>
          </div>

          {/* Description */}
          <div className="text-sm">
            <span className="font-medium">תיאור: </span>
            {request.description}
          </div>

          {/* Photos */}
          {photoUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photoUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => onPhotoClick(url)}
                  className="w-16 h-16 rounded-[10px] overflow-hidden border border-border hover:opacity-80 transition-opacity"
                >
                  <img
                    src={url}
                    alt={`תמונה ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Status actions */}
          {transitions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {transitions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleStatusChange(t.value)}
                  disabled={changingStatus}
                  className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-colors min-h-[40px] disabled:opacity-50 ${
                    t.value === "cancelled"
                      ? "bg-gray-100 text-text-secondary hover:bg-gray-200"
                      : "bg-accent text-white hover:bg-accent-dark"
                  }`}
                >
                  {changingStatus ? "..." : t.label}
                </button>
              ))}
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              הערות אדמין
            </label>
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="flex-1 rounded-[10px] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                placeholder="הערות פנימיות..."
              />
              <button
                onClick={handleNotesSave}
                disabled={saving || notes === (request.adminNotes || "")}
                className="self-end rounded-[10px] bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50 min-h-[40px]"
              >
                {saving ? "..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
