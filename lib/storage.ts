import { createClient } from "@/lib/supabase/server";

/**
 * Uploads evidence file directly to Supabase Storage without modification.
 */
export async function uploadEvidence(file: File, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Convert File to Buffer/ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload original file
  const { data, error } = await supabase.storage
    .from("evidence")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw error;

  // Return the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("evidence").getPublicUrl(data.path);

  return publicUrl;
}
