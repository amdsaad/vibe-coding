import { createClient } from "@/lib/supabase/client";

export async function uploadImage(
  bucket: string,
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}
