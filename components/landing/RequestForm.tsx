"use client";

import { useState } from "react";
import { WORK_TYPES, requestFormSchema } from "@/lib/validations";

type FieldErrors = Partial<Record<string, string>>;

export function RequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    workType: "",
    description: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ queuePosition: number } | null>(null);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);

    const validFiles: File[] = [];
    for (const file of toAdd) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, photos: "ניתן להעלות רק תמונות (JPG, PNG, WebP)" }));
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photos: "גודל קובץ מקסימלי: 5MB" }));
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setPhotos((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photos;
        return next;
      });
    }

    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const result = requestFormSchema.safeParse({
      ...formData,
      workType: formData.workType || undefined,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos first if any
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const uploadData = new FormData();
        photos.forEach((photo) => uploadData.append("photos", photo));

        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!uploadRes.ok) {
          throw new Error("שגיאה בהעלאת התמונות");
        }
        const uploadJson = await uploadRes.json();
        photoUrls = uploadJson.urls;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, photoUrls }),
      });

      if (res.status === 429) {
        setSubmitError("יותר מדי בקשות. נסו שוב מאוחר יותר");
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "שגיאה בשליחת הבקשה");
      }

      const data = await res.json();
      setSuccess({ queuePosition: data.queuePosition });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "שגיאה בשליחת הבקשה");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section id="request-form" className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-success-light border border-success/20 p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="font-heading text-2xl font-bold text-success mb-2">
            הבקשה שלכם התקבלה!
          </h2>
          {/* <p className="text-lg text-text-primary">
            אתם מספר <span className="font-bold text-accent">{success.queuePosition}</span> בתור
          </p> */}
          <p className="mt-4 text-sm text-text-secondary">
            ניצור איתכם קשר תוך 24 שעות
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="request-form" className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <h2 className="font-heading text-2xl font-bold text-center mb-8 sm:text-3xl">
          השאירו פרטים
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-surface p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-border sm:p-8">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              שם מלא
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent min-h-[48px]"
              placeholder="הכניסו את שמכם"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              טלפון
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent min-h-[48px] text-end"
              placeholder="050-123-4567"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1.5">
              כתובת / אזור
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent min-h-[48px]"
              placeholder="רחוב ומספר בית"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Work Type */}
          <div>
            <label htmlFor="workType" className="block text-sm font-medium mb-1.5">
              סוג העבודה
            </label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent min-h-[48px] appearance-none"
            >
              <option value="" disabled>בחרו סוג עבודה</option>
              {WORK_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.workType && <p className="mt-1 text-sm text-red-600">{errors.workType}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              תיאור הבקשה
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-[10px] border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent resize-none"
              placeholder="ספרו לנו מה צריך לעשות (לפחות 10 תווים)"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              תמונות (אופציונלי, עד 3)
            </label>
            {photoPreviews.length > 0 && (
              <div className="flex gap-3 mb-3 flex-wrap">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-[10px] overflow-hidden border border-border">
                    <img src={src} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 end-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none"
                      aria-label="הסרת תמונה"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 3 && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-border bg-background px-4 py-6 text-sm text-text-secondary transition-colors hover:border-accent min-h-[48px]">
                <span>📷</span>
                <span>לחצו להוספת תמונה</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoAdd}
                  className="hidden"
                />
              </label>
            )}
            {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
          </div>

          {submitError && (
            <div className="rounded-[10px] bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[10px] bg-accent px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-accent-dark active:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
          >
            {submitting ? "שולח..." : "שליחת בקשה"}
          </button>
        </form>
      </div>
    </section>
  );
}
