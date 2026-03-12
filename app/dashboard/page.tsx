import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ProjectListEditor } from "@/components/dashboard/project-list-editor";
import { DeleteProfileButton } from "@/components/dashboard/delete-profile-button";
import type { ProfileWithRelations } from "@/lib/database.types";

export default async function DashboardPage() {
  const claims = await requireAuth();
  const supabase = await createClient();
  const userId = (claims as Record<string, unknown>).sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, social_links(*), projects(*)")
    .eq("user_id", userId)
    .single();

  const typedProfile = profile as ProfileWithRelations | null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-sans font-bold uppercase tracking-wider mb-8">
        {typedProfile ? "EDIT YOUR PROFILE" : "CREATE YOUR PROFILE"}
      </h1>

      <div className="max-w-2xl space-y-12">
        <ProfileForm
          profile={typedProfile ?? undefined}
          userId={userId}
        />

        {typedProfile && (
          <>
            <section>
              <h2 className="text-xl font-sans font-bold uppercase tracking-wider mb-4">
                PROJECTS
              </h2>
              <ProjectListEditor
                projects={typedProfile.projects ?? []}
                profileId={typedProfile.id}
                userId={userId}
              />
            </section>

            <section className="border-t border-foreground/10 pt-8">
              <h2 className="text-xl font-sans font-bold uppercase tracking-wider mb-2 text-red-500">
                DANGER ZONE
              </h2>
              <p className="text-xs font-mono text-foreground/50 mb-4">
                Permanently delete your profile and all associated data.
              </p>
              <DeleteProfileButton />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
