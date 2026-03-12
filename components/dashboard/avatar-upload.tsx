"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { uploadImage } from "@/lib/storage";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  username?: string;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED = "image/jpeg,image/png,image/webp";

export function AvatarUpload({ currentAvatarUrl, userId, username = "U" }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error("File must be under 2MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP files are allowed");
      return;
    }

    setUploading(true);
    const { url, error } = await uploadImage("avatars", file, userId);
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      setAvatarUrl(url);
      toast.success("Avatar uploaded!");
    }
  }

  return (
    <div>
      <input type="hidden" name="avatar_url" value={avatarUrl} />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative cursor-pointer"
      >
        <Avatar
          src={avatarUrl || undefined}
          alt={username}
          size="lg"
        />
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-mono">
            {uploading ? "..." : "EDIT"}
          </span>
        </div>
      </button>
      {uploading && (
        <p className="text-xs font-mono text-foreground/50 mt-2">Uploading...</p>
      )}
    </div>
  );
}
