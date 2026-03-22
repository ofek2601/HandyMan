import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const cookieToken = request.cookies.get("handyman_admin")?.value;
  const queryKey = request.nextUrl.searchParams.get("key");

  if (cookieToken !== adminSecret && queryKey !== adminSecret) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  const [total] = await db.select({ value: count() }).from(requests);

  const [pending] = await db
    .select({ value: count() })
    .from(requests)
    .where(eq(requests.status, "pending"));

  const [inProgress] = await db
    .select({ value: count() })
    .from(requests)
    .where(eq(requests.status, "in_progress"));

  const [doneThisWeek] = await db
    .select({ value: count() })
    .from(requests)
    .where(
      and(
        eq(requests.status, "done"),
        gte(requests.updatedAt, sql`datetime('now', '-7 days')`)
      )
    );

  return NextResponse.json({
    total: total?.value ?? 0,
    pending: pending?.value ?? 0,
    inProgress: inProgress?.value ?? 0,
    doneThisWeek: doneThisWeek?.value ?? 0,
  });
}
