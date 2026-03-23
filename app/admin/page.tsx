"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatsBar } from "@/components/admin/StatsBar";
import { FilterBar } from "@/components/admin/FilterBar";
import { RequestCard } from "@/components/admin/RequestCard";
import { PhotoLightbox } from "@/components/admin/PhotoLightbox";
import type { Request } from "@/db/schema";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  doneThisWeek: number;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-text-secondary">טוען...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("all");
  const [workType, setWorkType] = useState("");
  const [sort, setSort] = useState("newest");

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Auth: check key param, set cookie, redirect clean
  useEffect(() => {
    const key = searchParams.get("key");

    if (key) {
      // Verify key against API first, then store cookie
      fetch(`/api/stats?key=${encodeURIComponent(key)}`)
        .then((res) => {
          if (res.ok) {
            document.cookie = `handyman_admin=${key}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
            setAuthed(true);
            router.replace("/admin");
          } else {
            setAuthed(false);
          }
        })
        .catch(() => setAuthed(false));
      return;
    }

    // No key param — check existing cookie
    fetch("/api/stats")
      .then((res) => {
        if (res.ok) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, [searchParams, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (workType) params.set("workType", workType);
      params.set("sort", sort);

      const [statsRes, requestsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch(`/api/requests?${params.toString()}`),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (requestsRes.ok) {
        setRequests(await requestsRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, [status, workType, sort]);

  useEffect(() => {
    if (authed) {
      fetchData();
    }
  }, [authed, fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleNotesChange = async (id: string, adminNotes: string) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    }
  };

  // Loading auth
  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">טוען...</p>
      </div>
    );
  }

  // Not authorized
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl bg-surface border border-border p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-heading text-xl font-bold mb-2">אין הרשאה</h1>
          <p className="text-sm text-text-secondary">
            נדרש מפתח גישה כדי להיכנס ללוח הניהול
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Header */}
        <h1 className="font-heading text-2xl font-bold">לוח ניהול</h1>

        {/* Stats */}
        {stats && <StatsBar stats={stats} />}

        {/* Filters */}
        <FilterBar
          status={status}
          workType={workType}
          sort={sort}
          onStatusChange={setStatus}
          onWorkTypeChange={setWorkType}
          onSortChange={setSort}
        />

        {/* Request list */}
        {loading ? (
          <p className="text-center text-text-secondary py-8">טוען...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-heading text-lg font-bold mb-1">אין בקשות עדיין</p>
            <p className="text-sm text-text-secondary">
              כשלקוחות ישלחו בקשות, הן יופיעו כאן
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onPhotoClick={setLightboxUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <PhotoLightbox
          url={lightboxUrl}
          onClose={() => setLightboxUrl(null)}
        />
      )}
    </div>
  );
}
