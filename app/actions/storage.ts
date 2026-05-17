"use server"

import { uploadEvidence } from "@/lib/storage"

export async function uploadEvidenceAction(formData: FormData) {
  const file = formData.get("file") as File
  const path = formData.get("path") as string

  if (!file) return { error: "No file provided" }
  if (file.size > 1024 * 1024) return { error: "File exceeds 1MB limit" }

  try {
    const url = await uploadEvidence(file, path)
    return { data: { url } }
  } catch (error: any) {
    return { error: error.message }
  }
}
