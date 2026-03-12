"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialLink } from "@/lib/database.types";

interface SocialLinksEditorProps {
  defaultValue?: SocialLink[];
}

type LinkRow = {
  platform: string;
  url: string;
  sort_order: number;
};

export function SocialLinksEditor({ defaultValue = [] }: SocialLinksEditorProps) {
  const [links, setLinks] = useState<LinkRow[]>(
    defaultValue.map((l) => ({
      platform: l.platform,
      url: l.url,
      sort_order: l.sort_order,
    }))
  );

  function addLink() {
    setLinks([...links, { platform: "", url: "", sort_order: links.length }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof LinkRow, value: string | number) {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  }

  return (
    <div>
      <input
        type="hidden"
        name="social_links"
        value={JSON.stringify(links.filter((l) => l.platform && l.url))}
      />
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-start">
            <Select
              options={SOCIAL_PLATFORMS}
              placeholder="Platform"
              value={link.platform}
              onChange={(e) => updateLink(i, "platform", e.target.value)}
              className="w-40 shrink-0"
            />
            <Input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLink(i)}
              className="shrink-0"
            >
              &times;
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLink}
        className="mt-3"
      >
        + ADD LINK
      </Button>
    </div>
  );
}
