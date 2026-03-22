import { NextResponse } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  const total = parseInt(process.env.NEXT_PUBLIC_PROMO_TOTAL_SLOTS || "0", 10);

  if (total === 0) {
    return NextResponse.json(
      { remaining: 0, total: 0, active: false },
      { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } }
    );
  }

  const [result] = await db.select({ value: count() }).from(requests);
  const requestCount = result?.value ?? 0;
  const remaining = Math.max(0, total - requestCount);

  return NextResponse.json(
    { remaining, total, active: remaining > 0 },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } }
  );
}
