"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";
import { getUser } from "@/lib/auth";
import { saveSocialLinks } from "@/actions/social-link";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

function parseFormData(formData: FormData) {
  return {
    username: formData.get("username") as string,
    slug: formData.get("slug") as string,
    bio: formData.get("bio") as string,
    category: formData.get("category") as string,
    theme: formData.get("theme") as string,
    skills: JSON.parse((formData.get("skills") as string) || "[]") as string[],
    published: formData.get("published") === "on" || formData.get("published") === "true",
    avatar_url: formData.get("avatar_url") as string,
  };
}

export async function createProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const claims = await getUser();
  if (!claims) {
    return { error: "You must be signed in." };
  }

  const raw = parseFormData(formData);
  const result = profileSchema.safeParse(raw);

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

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", result.data.slug)
    .single();

  if (existing) {
    return { error: "This slug is already taken.", fieldErrors: { slug: "This slug is already taken." } };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      username: result.data.username,
      slug: result.data.slug,
      bio: result.data.bio || null,
      avatar_url: result.data.avatar_url || null,
      category: result.data.category,
      theme: result.data.theme,
      skills: result.data.skills,
      published: result.data.published,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Save social links atomically
  const linksJson = formData.get("social_links") as string;
  if (linksJson && profile) {
    const links = JSON.parse(linksJson) as { platform: string; url: string; sort_order?: number }[];
    if (links.length > 0) {
      const linkResult = await saveSocialLinks(supabase, profile.id, links);
      if (linkResult.error) {
        return { error: `Profile created but social links failed: ${linkResult.error}` };
      }
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const claims = await getUser();
  if (!claims) {
    return { error: "You must be signed in." };
  }

  const raw = parseFormData(formData);
  const result = profileSchema.safeParse(raw);

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

  // Check slug uniqueness (exclude own profile)
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", result.data.slug)
    .neq("user_id", userId)
    .single();

  if (existing) {
    return { error: "This slug is already taken.", fieldErrors: { slug: "This slug is already taken." } };
  }

  // Get current profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!currentProfile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: result.data.username,
      slug: result.data.slug,
      bio: result.data.bio || null,
      avatar_url: result.data.avatar_url || null,
      category: result.data.category,
      theme: result.data.theme,
      skills: result.data.skills,
      published: result.data.published,
    })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  // Save social links atomically
  const linksJson = formData.get("social_links") as string;
  if (linksJson) {
    const links = JSON.parse(linksJson) as { platform: string; url: string; sort_order?: number }[];
    const linkResult = await saveSocialLinks(supabase, currentProfile.id, links);
    if (linkResult.error) {
      return { error: `Profile updated but social links failed: ${linkResult.error}` };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${result.data.slug}`);
  return { success: true };
}

export async function deleteProfile(): Promise<void> {
  const claims = await getUser();
  if (!claims) return;

  const supabase = await createClient();
  const userId = (claims as Record<string, unknown>).sub as string;

  await supabase.from("profiles").delete().eq("user_id", userId);

  revalidatePath("/");
  redirect("/dashboard");
}
