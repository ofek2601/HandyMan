import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { utapi } from "@/lib/uploadthing-server";

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

  if (!process.env.UPLOADTHING_TOKEN) {
    console.error("UPLOADTHING_TOKEN is not set");
    return NextResponse.json({ error: "שגיאה בהעלאת הקבצים" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "לא נבחרו קבצים" }, { status: 400 });
    }

    if (files.length > 3) {
      return NextResponse.json({ error: "ניתן להעלות עד 3 תמונות" }, { status: 400 });
    }

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return NextResponse.json({ error: "ניתן להעלות רק תמונות (JPG, PNG, WebP)" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "גודל קובץ מקסימלי: 5MB" }, { status: 400 });
      }
    }

    const response = await utapi.uploadFiles(files);
    // uploadFiles returns a single object for one file, array for multiple
    const results = Array.isArray(response) ? response : [response];
    const urls = results
      .filter((r) => r.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r) => (r.data as any).ufsUrl ?? (r.data as any).url)
      .filter(Boolean);

    if (urls.length === 0) {
      const errors = results.map((r) => r.error?.message).filter(Boolean);
      console.error("Uploadthing upload failed:", errors);
      return NextResponse.json({ error: "שגיאה בהעלאת הקבצים" }, { status: 500 });
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "שגיאה בהעלאת הקבצים" }, { status: 500 });
  }
}
