export const STATUSES = ["Applied", "Interviewing", "Offer", "Interview and Rejected", "Rejected"];

export const STATUS_META = {
  Applied: { label: "Applied", fill: "var(--color-accent-2-600)", ink: "text-accent-2-300", stage: "waiting" },
  Interviewing: { label: "Interviewing", fill: "var(--color-accent-2-400)", ink: "text-accent-2-200", stage: "active" },
  Offer: { label: "Offer", fill: "var(--color-accent-2-200)", ink: "text-accent-2-100", stage: "won" },
  "Interview and Rejected": { label: "Interviewed, rejected", fill: "color-mix(in srgb, var(--color-bright) 36%, transparent)", ink: "text-fg/70", stage: "closed" },
  Rejected: { label: "Rejected", fill: "color-mix(in srgb, var(--color-bright) 20%, transparent)", ink: "text-muted", stage: "closed" },
};

export const metaFor = (s) => STATUS_META[s] || { label: s || "No status", fill: "color-mix(in srgb, var(--color-bright) 8%, transparent)", ink: "text-muted", stage: "unknown" };

export const RESPONDED = new Set(["Interviewing", "Offer", "Interview and Rejected"]);

export const HEAT = ["var(--color-panel-2)", "var(--color-accent-2-900)", "var(--color-accent-2-700)", "var(--color-accent-2)", "var(--color-accent-2-300)"];

export const HIERARCHY = ["Offer", "Interviewing", "Applied", "Interview and Rejected", "Rejected"];

export const rankOf = (s) => {
  const i = HIERARCHY.indexOf(s);
  return i < 0 ? HIERARCHY.length : i;
};

export const ACTIVE = new Set(["Applied", "Interviewing", "Offer"]);
