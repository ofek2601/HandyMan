import { z } from "zod/v4";

export const WORK_TYPES = [
  "תליית תמונות ומדפים",
  "הרכבת ארונות ורהיטים",
  "תיקונים כלליים",
  "חשמל ותאורה בסיסיים",
  "אינסטלציה קלה",
  "עבודות בית שונות",
  "אחר",
] as const;

export const requestFormSchema = z.object({
  name: z
    .string()
    .min(2, "שם חייב להכיל לפחות 2 תווים")
    .max(100, "שם יכול להכיל עד 100 תווים"),
  phone: z
    .string()
    .regex(/^05\d{1}-?\d{3}-?\d{4}$/, "מספר טלפון לא תקין"),
  address: z
    .string()
    .min(2, "כתובת חייבת להכיל לפחות 2 תווים")
    .max(200, "כתובת יכולה להכיל עד 200 תווים"),
  workType: z.enum(WORK_TYPES, {
    error: "יש לבחור סוג עבודה",
  }),
  description: z
    .string()
    .min(10, "תיאור חייב להכיל לפחות 10 תווים")
    .max(1000, "תיאור יכול להכיל עד 1000 תווים"),
  photoUrls: z.array(z.string()).max(3, "ניתן להעלות עד 3 תמונות").optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
