import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Placeholder upload route - will be replaced with Uploadthing integration
// For now, accepts files and returns placeholder URLs for testing the form flow
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

  try {
    const formData = await request.formData();
    const files = formData.getAll("photos");

    if (files.length === 0) {
      return NextResponse.json({ error: "לא נבחרו קבצים" }, { status: 400 });
    }

    if (files.length > 3) {
      return NextResponse.json({ error: "ניתן להעלות עד 3 תמונות" }, { status: 400 });
    }

    // TODO: Replace with Uploadthing integration
    // For now, return placeholder URLs so the form flow works end-to-end
    const urls = files.map((_, i) => `/placeholder-photo-${Date.now()}-${i}.jpg`);

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "שגיאה בהעלאת הקבצים" }, { status: 500 });
  }
}
