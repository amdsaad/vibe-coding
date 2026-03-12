"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface SlugInputProps {
  currentSlug?: string;
  defaultValue?: string;
  error?: boolean;
}

export function SlugInput({ currentSlug, defaultValue = "", error }: SlugInputProps) {
  const [slug, setSlug] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!slug || slug.length < 2) {
      setStatus("idle");
      return;
    }

    if (slug === currentSlug) {
      setStatus("available");
      return;
    }

    setStatus("checking");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .single();

      setStatus(data ? "taken" : "available");
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slug, currentSlug]);

  return (
    <div>
      <div className="relative">
        <Input
          name="slug"
          placeholder="jane-doe"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          error={error || status === "taken"}
          required
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
          {status === "checking" && (
            <span className="h-4 w-4 inline-block animate-spin rounded-full border-2 border-foreground/30 border-t-teal-500" />
          )}
          {status === "available" && (
            <span className="text-green-500">&#10003;</span>
          )}
          {status === "taken" && (
            <span className="text-red-500">&#10005;</span>
          )}
        </span>
      </div>
      {slug.length >= 2 && (
        <p className="text-xs font-mono text-foreground/50 mt-1">/u/{slug}</p>
      )}
      {status === "taken" && (
        <p className="text-xs font-mono text-red-500 mt-1">This slug is already taken</p>
      )}
    </div>
  );
}
