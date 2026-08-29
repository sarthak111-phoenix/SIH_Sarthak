export function formatCurrency(amount: number, locale: string = "en-IN", currency: string = "INR"): string {
  try {
    const loc = locale === "hi" ? "hi-IN" : locale === "hinglish" ? "en-IN" : "en-IN";
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (err) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

export function formatDate(date: string | Date, locale: string = "en-IN"): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const loc = locale === "hi" ? "hi-IN" : "en-IN";
    return new Intl.DateTimeFormat(loc, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch (err) {
    return String(date);
  }
}

export function formatNumber(num: number, locale: string = "en-IN"): string {
  try {
    const loc = locale === "hi" ? "hi-IN" : "en-IN";
    return new Intl.NumberFormat(loc).format(num);
  } catch (err) {
    return num.toString();
  }
}
