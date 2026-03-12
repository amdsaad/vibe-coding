"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { uploadImage } from "@/lib/storage";
import {
  addProject,
  updateProject,
  type ProjectActionState,
} from "@/actions/project";
import type { Project } from "@/lib/database.types";

interface ProjectCardEditorProps {
  project?: Project;
  userId: string;
  onCancel?: () => void;
}

const initialState: ProjectActionState = {};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function ProjectCardEditor({ project, userId, onCancel }: ProjectCardEditorProps) {
  const isEdit = !!project;
  const action = isEdit ? updateProject : addProject;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const prevStateRef = useRef(state);
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state.success) {
        toast.success(isEdit ? "Project updated!" : "Project added!");
        if (!isEdit && onCancel) onCancel();
      } else if (state.error) {
        toast.error(state.error);
      }
      prevStateRef.current = state;
    }
  }, [state, isEdit, onCancel]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("File must be under 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, and GIF files are allowed");
      return;
    }

    setUploading(true);
    const { url, error } = await uploadImage("project-images", file, userId);
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      setImageUrl(url);
      toast.success("Image uploaded!");
    }
  }

  return (
    <form action={formAction} className="space-y-4 border border-foreground/10 rounded-lg p-4">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="user_id" value={userId} />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-md border border-dashed border-foreground/20 flex items-center justify-center hover:border-foreground/40 transition-colors overflow-hidden"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Project image"
              width={400}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-mono text-foreground/40">
              {uploading ? "UPLOADING..." : "CLICK TO ADD IMAGE"}
            </span>
          )}
        </button>
      </div>

      <FormField label="TITLE" error={state.fieldErrors?.title}>
        <Input
          name="title"
          placeholder="Project title"
          defaultValue={project?.title ?? ""}
          error={!!state.fieldErrors?.title}
          required
        />
      </FormField>

      <FormField label="DESCRIPTION" error={state.fieldErrors?.description}>
        <Textarea
          name="description"
          placeholder="Describe your project..."
          defaultValue={project?.description ?? ""}
          error={!!state.fieldErrors?.description}
          rows={3}
          maxLength={500}
        />
      </FormField>

      <FormField label="URL" error={state.fieldErrors?.url}>
        <Input
          name="url"
          type="url"
          placeholder="https://..."
          defaultValue={project?.url ?? ""}
          error={!!state.fieldErrors?.url}
        />
      </FormField>

      <FormField label="SORT ORDER">
        <Input
          name="sort_order"
          type="number"
          defaultValue={project?.sort_order ?? 0}
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" loading={isPending} size="sm">
          {isPending ? "SAVING..." : isEdit ? "UPDATE" : "ADD PROJECT"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            CANCEL
          </Button>
        )}
      </div>
    </form>
  );
}
