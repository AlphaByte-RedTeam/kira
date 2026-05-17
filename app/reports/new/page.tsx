import { redirect } from "next/navigation";
import { generateId } from "@/lib/uuid";

export default function NewReportPage() {
  const id = generateId();

  // Initialize an empty draft in local storage
  // The report editor will pick this up automatically
  const _draft = {
    id,
    title: "",
    client_id: "",
    targets: [],
    vulnerabilities: [],
    executive_summary: "",
    status: "draft",
    created_at: new Date().toISOString(),
  };

  // Note: We perform the localStorage save inside the editor component
  // to ensure we are in a 'use client' context.
  // We simply redirect to the new URL.
  redirect(`/reports/${id}`);
}
