import { Cvss3P1 } from "ae-cvss-calculator";

export type CVSSResult = {
  score: number;
  severity: "None" | "Informational" | "Low" | "Medium" | "High" | "Critical";
  vector: string;
};

export function calculateCVSS(vector: string): CVSSResult {
  try {
    const calculator = new Cvss3P1(vector);
    const score = calculator.calculateExactOverallScore();

    let severity: CVSSResult["severity"] = "None";
    if (score >= 9.0) severity = "Critical";
    else if (score >= 7.0) severity = "High";
    else if (score >= 4.0) severity = "Medium";
    else if (score >= 0.1) severity = "Low";
    else severity = "Informational";

    return {
      score: Number(score.toFixed(1)),
      severity,
      vector,
    };
  } catch (_e) {
    return { score: 0, severity: "None", vector };
  }
}

export const DEFAULT_CVSS_VECTOR =
  "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N/E:X/RL:X/RC:X/CR:X/IR:X/AR:X/MAV:X/MAC:X/MPR:X/MUI:X/MS:X/MC:X/MI:X/MA:X";
