"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateCVSS } from "@/lib/cvss";

const METRIC_GROUPS = {
  base: {
    title: "BASE",
    description:
      "Represent the intrinsic qualities of a vulnerability that are constant over time and across user environments.",
    metrics: [
      {
        name: "Attack Vector (AV)",
        key: "AV",
        options: [
          { l: "Network", v: "N" },
          { l: "Adjacent", v: "A" },
          { l: "Local", v: "L" },
          { l: "Physical", v: "P" },
        ],
      },
      {
        name: "Attack Complexity (AC)",
        key: "AC",
        options: [
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Privileges Required (PR)",
        key: "PR",
        options: [
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "User Interaction (UI)",
        key: "UI",
        options: [
          { l: "None", v: "N" },
          { l: "Required", v: "R" },
        ],
      },
      {
        name: "Scope (S)",
        key: "S",
        options: [
          { l: "Unchanged", v: "U" },
          { l: "Changed", v: "C" },
        ],
      },
      {
        name: "Confidentiality (C)",
        key: "C",
        options: [
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Integrity (I)",
        key: "I",
        options: [
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Availability (A)",
        key: "A",
        options: [
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
    ],
  },
  temporal: {
    title: "TEMPORAL",
    description:
      "Reflect the characteristics of a vulnerability that may change over time, such as exploit code maturity.",
    metrics: [
      {
        name: "Exploit Code Maturity (E)",
        key: "E",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "High", v: "H" },
          { l: "Functional", v: "F" },
          { l: "Proof-of-Concept", v: "P" },
          { l: "Unproven", v: "U" },
        ],
      },
      {
        name: "Remediation Level (RL)",
        key: "RL",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Official Fix", v: "O" },
          { l: "Temporary Fix", v: "T" },
          { l: "Workaround", v: "W" },
          { l: "Unavailable", v: "U" },
        ],
      },
      {
        name: "Report Confidence (RC)",
        key: "RC",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Confirmed", v: "C" },
          { l: "Reasonable", v: "R" },
          { l: "Unknown", v: "U" },
        ],
      },
    ],
  },
  environmental: {
    title: "ENVIRONMENTAL",
    description:
      "Represent the characteristics of a vulnerability that are relevant and unique to a user's specific IT environment.",
    metrics: [
      {
        name: "Confidentiality Req (CR)",
        key: "CR",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Low", v: "L" },
          { l: "Medium", v: "M" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Integrity Req (IR)",
        key: "IR",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Low", v: "L" },
          { l: "Medium", v: "M" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Availability Req (AR)",
        key: "AR",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Low", v: "L" },
          { l: "Medium", v: "M" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Modified Attack Vector (MAV)",
        key: "MAV",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Network", v: "N" },
          { l: "Adjacent", v: "A" },
          { l: "Local", v: "L" },
          { l: "Physical", v: "P" },
        ],
      },
      {
        name: "Modified Attack Complexity (MAC)",
        key: "MAC",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Modified Privileges (MPR)",
        key: "MPR",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Modified User Interaction (MUI)",
        key: "MUI",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "None", v: "N" },
          { l: "Required", v: "R" },
        ],
      },
      {
        name: "Modified Scope (MS)",
        key: "MS",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "Unchanged", v: "U" },
          { l: "Changed", v: "C" },
        ],
      },
      {
        name: "Modified Confidentiality (MC)",
        key: "MC",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Modified Integrity (MI)",
        key: "MI",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
      {
        name: "Modified Availability (MA)",
        key: "MA",
        options: [
          { l: "Not Defined", v: "X" },
          { l: "None", v: "N" },
          { l: "Low", v: "L" },
          { l: "High", v: "H" },
        ],
      },
    ],
  },
};

export function CVSSCalculator({
  vector,
  onChange,
}: {
  vector: string;
  onChange: (v: string) => void;
}) {
  const currentValues = React.useMemo(() => {
    const parts = vector.split("/");
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      const [k, v] = p.split(":");
      if (k && v) map[k] = v;
    });
    return map;
  }, [vector]);

  const updateVector = (key: string, val: string) => {
    const next = { ...currentValues, [key]: val };
    const newVector = [
      "CVSS:3.1",
      ...METRIC_GROUPS.base.metrics.map(
        (m) => `${m.key}:${next[m.key] || "N"}`,
      ),
      ...METRIC_GROUPS.temporal.metrics.map(
        (m) => `${m.key}:${next[m.key] || "X"}`,
      ),
      ...METRIC_GROUPS.environmental.metrics.map(
        (m) => `${m.key}:${next[m.key] || "X"}`,
      ),
    ].join("/");
    onChange(newVector);
  };

  return (
    <div className="space-y-4">
      {Object.entries(METRIC_GROUPS).map(([group, data]) => (
        <Card key={group}>
          <CardContent>
            <div className="mb-6">
              <Label className="block font-semibold uppercase text-muted-foreground">
                {data.title}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.metrics.map((m) => (
                <div key={m.key} className="space-y-1">
                  <Label className="text-xs">{m.name}</Label>
                  <Select
                    value={currentValues[m.key] || ""}
                    onValueChange={(v) => updateVector(m.key, v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {m.options.map((o) => (
                        <SelectItem key={o.v} value={o.v}>
                          {o.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="space-y-1 rounded bg-muted p-3 font-mono text-[10px]">
        <div className="break-all">{vector}</div>
        <div className="text-muted-foreground mt-2 border-t pt-2">
          Calculated Score: {calculateCVSS(vector).score.toFixed(1)} | Severity:{" "}
          {calculateCVSS(vector).severity}
        </div>
      </div>
    </div>
  );
}
