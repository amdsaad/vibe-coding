"use client";

import { useState } from "react";
import { THEMES } from "@/lib/constants";

interface ThemePickerProps {
  defaultValue?: string;
}

const themeColors: Record<string, { bg: string; text: string; accent: string }> = {
  minimal: { bg: "#FAFAF8", text: "#0A0A0A", accent: "#E70000" },
  bold: { bg: "#0A0A0A", text: "#FAFAF8", accent: "#E70000" },
  elegant: { bg: "#F5F0EB", text: "#1A1A1A", accent: "#8B6914" },
  neon: { bg: "#0D0D0D", text: "#E0E0E0", accent: "#00FF88" },
  paper: { bg: "#F4F1EA", text: "#2C2C2C", accent: "#B85C38" },
  terminal: { bg: "#1E1E1E", text: "#00FF00", accent: "#00FF00" },
};

export function ThemePicker({ defaultValue = "minimal" }: ThemePickerProps) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <div>
      <input type="hidden" name="theme" value={selected} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((theme) => {
          const colors = themeColors[theme.value];
          const isSelected = selected === theme.value;
          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => setSelected(theme.value)}
              className={`rounded-lg border-2 p-3 text-left transition-colors ${
                isSelected
                  ? "border-teal-500"
                  : "border-foreground/10 hover:border-foreground/30"
              }`}
            >
              <div
                className="h-12 rounded-md mb-2 flex items-end p-2"
                style={{ backgroundColor: colors.bg }}
              >
                <div className="flex gap-1">
                  <div
                    className="h-2 w-6 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                  <div
                    className="h-2 w-4 rounded-full opacity-50"
                    style={{ backgroundColor: colors.text }}
                  />
                </div>
              </div>
              <p className="text-xs font-mono font-medium uppercase tracking-wide">
                {theme.label}
              </p>
              <p className="text-[10px] font-mono text-foreground/50">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
