export async function sendTelegramNotification(request: {
  id: string;
  name: string;
  phone: string;
  address: string;
  workType: string;
  description: string;
  queuePosition: number;
  photoUrls?: string[] | null;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram env vars missing:", { botToken: !!botToken, chatId: !!chatId });
    return;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app";
  const adminUrl = `${siteUrl}/admin`;

  const photoLine = request.photoUrls?.length
    ? `תמונות: ${request.photoUrls.length} צורפו`
    : "תמונות: לא צורפו";

  const message = [
    "--- בקשה חדשה התקבלה! ---",
    "",
    `שם: ${request.name}`,
    `טלפון: ${request.phone}`,
    `כתובת: ${request.address}`,
    `סוג עבודה: ${request.workType}`,
    `תיאור: ${request.description}`,
    photoLine,
    "",
    `מספר בתור: ${request.queuePosition}`,
    "",
    `לוח ניהול: ${adminUrl}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram API error:", res.status, body);
    }
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}
