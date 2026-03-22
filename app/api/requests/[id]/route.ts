import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled"],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSecret = process.env.ADMIN_SECRET;
  const cookieToken = request.cookies.get("handyman_admin")?.value;
  const queryKey = request.nextUrl.searchParams.get("key");

  if (cookieToken !== adminSecret && queryKey !== adminSecret) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: string; adminNotes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, id));

  if (!existing) {
    return NextResponse.json({ error: "בקשה לא נמצאה" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updatedAt: sql`datetime('now')`,
  };

  if (body.status) {
    const allowed = VALID_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(body.status)) {
      return NextResponse.json(
        { error: "מעבר סטטוס לא חוקי" },
        { status: 400 }
      );
    }
    updates.status = body.status;
  }

  if (body.adminNotes !== undefined) {
    updates.adminNotes = body.adminNotes;
  }

  await db.update(requests).set(updates).where(eq(requests.id, id));

  const [updated] = await db.select().from(requests).where(eq(requests.id, id));

  return NextResponse.json(updated);
}
