"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validators";
import { getUser } from "@/lib/auth";

export type ProjectActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function addProject(
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const claims = await getUser();
  if (!claims) {
    return { error: "You must be signed in." };
  }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    url: formData.get("url") as string,
    sort_order: formData.get("sort_order") as string,
  };

  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of result.error.issues) {
      const field = err.path[0];
      if (typeof field === "string") {
        fieldErrors[field] = err.message;
      }
    }
    return { error: "Validation failed.", fieldErrors };
  }

  const supabase = await createClient();
  const userId = (claims as Record<string, unknown>).sub as string;

  // Get profile ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return { error: "Profile not found. Create a profile first." };
  }

  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase.from("projects").insert({
    profile_id: profile.id,
    title: result.data.title,
    description: result.data.description || null,
    url: result.data.url || null,
    image_url: imageUrl || null,
    sort_order: result.data.sort_order,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProject(
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const claims = await getUser();
  if (!claims) {
    return { error: "You must be signed in." };
  }

  const projectId = formData.get("id") as string;
  if (!projectId) {
    return { error: "Project ID is required." };
  }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    url: formData.get("url") as string,
    sort_order: formData.get("sort_order") as string,
  };

  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of result.error.issues) {
      const field = err.path[0];
      if (typeof field === "string") {
        fieldErrors[field] = err.message;
      }
    }
    return { error: "Validation failed.", fieldErrors };
  }

  const supabase = await createClient();
  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase
    .from("projects")
    .update({
      title: result.data.title,
      description: result.data.description || null,
      url: result.data.url || null,
      image_url: imageUrl || null,
      sort_order: result.data.sort_order,
    })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeProject(formData: FormData): Promise<void> {
  const claims = await getUser();
  if (!claims) return;

  const projectId = formData.get("id") as string;
  if (!projectId) return;

  const supabase = await createClient();

  await supabase.from("projects").delete().eq("id", projectId);

  revalidatePath("/dashboard");
}
