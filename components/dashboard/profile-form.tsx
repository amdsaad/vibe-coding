"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { CategorySelect } from "@/components/dashboard/category-select";
import { ThemePicker } from "@/components/dashboard/theme-picker";
import { SlugInput } from "@/components/dashboard/slug-input";
import { SkillsInput } from "@/components/dashboard/skills-input";
import { SocialLinksEditor } from "@/components/dashboard/social-links-editor";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import {
  createProfile,
  updateProfile,
  type ProfileActionState,
} from "@/actions/profile";
import type { ProfileWithRelations } from "@/lib/database.types";

interface ProfileFormProps {
  profile?: ProfileWithRelations;
  userId: string;
}

const initialState: ProfileActionState = {};

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const isEdit = !!profile;
  const action = isEdit ? updateProfile : createProfile;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state.success) {
        toast.success(isEdit ? "Profile updated!" : "Profile created!");
      } else if (state.error) {
        toast.error(state.error);
      }
      prevStateRef.current = state;
    }
  }, [state, isEdit]);

  return (
    <form action={formAction} className="space-y-6">
      <AvatarUpload
        currentAvatarUrl={profile?.avatar_url}
        userId={userId}
        username={profile?.username}
      />

      <input type="hidden" name="user_id" value={userId} />

      <FormField label="USERNAME" error={state.fieldErrors?.username}>
        <Input
          name="username"
          placeholder="Jane Doe"
          defaultValue={profile?.username ?? ""}
          error={!!state.fieldErrors?.username}
          required
        />
      </FormField>

      <FormField label="SLUG" error={state.fieldErrors?.slug}>
        <SlugInput
          currentSlug={profile?.slug}
          defaultValue={profile?.slug ?? ""}
          error={!!state.fieldErrors?.slug}
        />
      </FormField>

      <FormField label="BIO" error={state.fieldErrors?.bio}>
        <Textarea
          name="bio"
          placeholder="Tell us about yourself..."
          defaultValue={profile?.bio ?? ""}
          error={!!state.fieldErrors?.bio}
          rows={4}
          maxLength={500}
        />
      </FormField>

      <FormField label="CATEGORY" error={state.fieldErrors?.category}>
        <CategorySelect
          defaultValue={profile?.category ?? "developer"}
          error={!!state.fieldErrors?.category}
        />
      </FormField>

      <FormField label="SKILLS">
        <SkillsInput defaultValue={profile?.skills ?? []} />
      </FormField>

      <FormField label="SOCIAL LINKS">
        <SocialLinksEditor defaultValue={profile?.social_links ?? []} />
      </FormField>

      <FormField label="THEME">
        <ThemePicker defaultValue={profile?.theme ?? "minimal"} />
      </FormField>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={profile?.published ?? true}
          className="h-4 w-4 rounded border-foreground/20 accent-teal-500"
        />
        <label htmlFor="published" className="text-sm font-mono">
          PUBLISHED
        </label>
      </div>

      <Button type="submit" loading={isPending} size="lg">
        {isPending
          ? isEdit
            ? "SAVING..."
            : "CREATING..."
          : isEdit
            ? "SAVE CHANGES"
            : "CREATE PROFILE"}
      </Button>
    </form>
  );
}
