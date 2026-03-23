import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { requestFormSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { nanoid } from "nanoid";
import { eq, count, desc, asc } from "drizzle-orm";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסו שוב מאוחר יותר" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const result = requestFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "נתונים לא תקינים", details: result.error.issues },
      { status: 400 }
    );
  }

  const { name, phone, address, workType, description, photoUrls } = result.data;

  // Calculate queue position (count of pending requests + 1)
  const [pendingCount] = await db
    .select({ value: count() })
    .from(requests)
    .where(eq(requests.status, "pending"));

  const queuePosition = (pendingCount?.value ?? 0) + 1;
  const id = nanoid(12);

  await db.insert(requests).values({
    id,
    name,
    phone,
    address,
    workType,
    description,
    photoUrls: photoUrls && photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
    queuePosition,
  });

  // Run after response is sent — guaranteed to complete on Vercel
  after(async () => {
    await sendTelegramNotification({
      id,
      name,
      phone,
      address,
      workType,
      description,
      queuePosition,
      photoUrls: photoUrls ?? null,
    }).catch(() => {});
  });

  return NextResponse.json({ id, queuePosition }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const cookieToken = request.cookies.get("handyman_admin")?.value;
  const queryKey = request.nextUrl.searchParams.get("key");

  if (cookieToken !== adminSecret && queryKey !== adminSecret) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const workType = request.nextUrl.searchParams.get("workType");
  const sort = request.nextUrl.searchParams.get("sort") || "newest";

  let query = db.select().from(requests).$dynamic();

  if (status && status !== "all") {
    query = query.where(eq(requests.status, status as "pending" | "in_progress" | "done" | "cancelled"));
  }

  if (workType) {
    query = query.where(eq(requests.workType, workType));
  }

  query = query.orderBy(sort === "oldest" ? asc(requests.createdAt) : desc(requests.createdAt));

  const results = await query;

  return NextResponse.json(results);
}
