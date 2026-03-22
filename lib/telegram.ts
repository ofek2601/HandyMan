function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

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

  if (!botToken || !chatId) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app";
  const adminUrl = `${siteUrl}/admin`;

  const photoLine = request.photoUrls?.length
    ? `📷 תמונות: ${request.photoUrls.length} צורפו`
    : "📷 תמונות: לא צורפו";

  const message = [
    "🔔 *בקשה חדשה התקבלה\\!*",
    "",
    `👤 *שם:* ${escapeMarkdown(request.name)}`,
    `📞 *טלפון:* ${escapeMarkdown(request.phone)}`,
    `📍 *כתובת:* ${escapeMarkdown(request.address)}`,
    `🔧 *סוג עבודה:* ${escapeMarkdown(request.workType)}`,
    `📝 *תיאור:* ${escapeMarkdown(request.description)}`,
    photoLine,
    "",
    `📊 *מספר בתור:* ${request.queuePosition}`,
    "",
    `[פתח בלוח הניהול](${escapeMarkdown(adminUrl)})`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}
