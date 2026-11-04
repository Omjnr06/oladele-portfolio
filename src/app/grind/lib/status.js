export const STATUSES = ["Applied", "Interviewing", "Offer", "Interview and Rejected", "Rejected"];

export const STATUS_META = {
  Applied: { label: "Applied", fill: "#7c3aed", ink: "text-[#c4b5fd]", stage: "waiting" },
  Interviewing: { label: "Interviewing", fill: "#a78bfa", ink: "text-[#ddd6fe]", stage: "active" },
  Offer: { label: "Offer", fill: "#ddd6fe", ink: "text-[#ede9fe]", stage: "won" },
  "Interview and Rejected": { label: "Interviewed, rejected", fill: "rgb(255 255 255 / 0.36)", ink: "text-fg/70", stage: "closed" },
  Rejected: { label: "Rejected", fill: "rgb(255 255 255 / 0.2)", ink: "text-muted", stage: "closed" },
};

export const metaFor = (s) => STATUS_META[s] || { label: s || "No status", fill: "rgb(255 255 255 / 0.08)", ink: "text-muted", stage: "unknown" };

export const RESPONDED = new Set(["Interviewing", "Offer", "Interview and Rejected"]);

export const HEAT = ["#121214", "#4c1d95", "#6d28d9", "#8b5cf6", "#c4b5fd"];

export const HIERARCHY = ["Offer", "Interviewing", "Applied", "Interview and Rejected", "Rejected"];

export const rankOf = (s) => {
  const i = HIERARCHY.indexOf(s);
  return i < 0 ? HIERARCHY.length : i;
};

export const ACTIVE = new Set(["Applied", "Interviewing", "Offer"]);
