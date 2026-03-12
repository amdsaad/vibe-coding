import { socialLinkSchema } from "@/lib/validators";
import type { SupabaseClient } from "@supabase/supabase-js";

type SocialLinkInput = {
  platform: string;
  url: string;
  sort_order?: number;
};

export async function saveSocialLinks(
  supabase: SupabaseClient,
  profileId: string,
  links: SocialLinkInput[]
): Promise<{ error: string | null }> {
  // Validate each link
  for (const link of links) {
    const result = socialLinkSchema.safeParse(link);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }
  }

  // Delete all existing links for this profile
  const { error: deleteError } = await supabase
    .from("social_links")
    .delete()
    .eq("profile_id", profileId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Insert new links (if any)
  if (links.length > 0) {
    const rows = links.map((link, index) => ({
      profile_id: profileId,
      platform: link.platform,
      url: link.url,
      sort_order: link.sort_order ?? index,
    }));

    const { error: insertError } = await supabase
      .from("social_links")
      .insert(rows);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return { error: null };
}
