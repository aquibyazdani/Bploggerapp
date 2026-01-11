type BPLevel =
  | "low"
  | "optimal"
  | "normal"
  | "highNormal"
  | "stage1"
  | "stage2"
  | "stage3";

type BPLevelMeta = {
  shortLabel: string;
  longLabel: string;
  color: string;
};

const BP_LEVEL_META: Record<BPLevel, BPLevelMeta> = {
  low: { shortLabel: "Low", longLabel: "Low", color: "#0ea5e9" },
  optimal: { shortLabel: "Optimal", longLabel: "Optimal", color: "#10b981" },
  normal: { shortLabel: "Normal", longLabel: "Normal", color: "#10b981" },
  highNormal: {
    shortLabel: "High-Normal",
    longLabel: "High Normal",
    color: "#f59e0b",
  },
  stage1: {
    shortLabel: "High-1",
    longLabel: "High (Stage 1)",
    color: "#ef4444",
  },
  stage2: {
    shortLabel: "High-2",
    longLabel: "High (Stage 2)",
    color: "#dc2626",
  },
  stage3: {
    shortLabel: "High-3",
    longLabel: "High (Stage 3)",
    color: "#991b1b",
  },
};

function getSystolicLevel(value: number): BPLevel {
  if (value < 90) return "low";
  if (value < 120) return "optimal";
  if (value < 130) return "normal";
  if (value < 140) return "highNormal";
  if (value < 160) return "stage1";
  if (value < 180) return "stage2";
  return "stage3";
}

function getDiastolicLevel(value: number): BPLevel {
  if (value < 60) return "low";
  if (value < 80) return "optimal";
  if (value < 85) return "normal";
  if (value < 90) return "highNormal";
  if (value < 100) return "stage1";
  if (value < 110) return "stage2";
  return "stage3";
}

function getOverallHighLevel(sys: BPLevel, dia: BPLevel): BPLevel | null {
  const rank: Record<BPLevel, number> = {
    low: 0,
    optimal: 0,
    normal: 0,
    highNormal: 0,
    stage1: 1,
    stage2: 2,
    stage3: 3,
  };

  const maxRank = Math.max(rank[sys], rank[dia]);
  if (maxRank === 3) return "stage3";
  if (maxRank === 2) return "stage2";
  if (maxRank === 1) return "stage1";
  return null;
}

export function getBPCategory(
  systolic: number,
  diastolic: number
): { label: string; color: string; message: string } {
  const sysLevel = getSystolicLevel(systolic);
  const diaLevel = getDiastolicLevel(diastolic);
  const hasHighNormal = sysLevel === "highNormal" || diaLevel === "highNormal";
  const hasLow = sysLevel === "low" || diaLevel === "low";
  const overallHigh = getOverallHighLevel(sysLevel, diaLevel);

  let overallLevel: BPLevel;
  if (overallHigh) {
    overallLevel = overallHigh;
  } else if (hasHighNormal) {
    overallLevel = "highNormal";
  } else if (hasLow) {
    overallLevel = "low";
  } else if (sysLevel === "normal" || diaLevel === "normal") {
    overallLevel = "normal";
  } else {
    overallLevel = "optimal";
  }

  const overallMeta = BP_LEVEL_META[overallLevel];
  const sysMeta = BP_LEVEL_META[sysLevel];
  const diaMeta = BP_LEVEL_META[diaLevel];

  let overallMessage = "";
  if (overallLevel === "stage3") {
    overallMessage =
      "Severe hypertension per Indian guidelines. Seek urgent medical care.";
  } else if (overallLevel === "stage2") {
    overallMessage =
      "Stage 2 hypertension per Indian guidelines. Seek medical attention.";
  } else if (overallLevel === "stage1") {
    overallMessage =
      "Stage 1 hypertension per Indian guidelines. Consult your healthcare provider.";
  } else if (overallLevel === "highNormal") {
    overallMessage =
      "High-normal blood pressure. Consider lifestyle improvements.";
  } else if (overallLevel === "low") {
    overallMessage =
      "Low blood pressure detected. If you feel unwell, consult a clinician.";
  } else if (overallLevel === "normal") {
    overallMessage = "Normal blood pressure. Keep monitoring regularly.";
  } else {
    overallMessage = "Optimal blood pressure. Keep up the healthy routine.";
  }

  if (hasLow && (overallHigh || hasHighNormal)) {
    overallMessage =
      "Mixed blood pressure reading. Consider medical advice if this persists.";
  }

  const label = `S: ${sysMeta.shortLabel} | D: ${diaMeta.shortLabel}`;

  return {
    label,
    color: overallMeta.color,
    message: `${overallMessage} Systolic: ${sysMeta.longLabel}. Diastolic: ${diaMeta.longLabel}.`,
  };
}
