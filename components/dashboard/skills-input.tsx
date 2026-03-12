"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SkillsInputProps {
  defaultValue?: string[];
}

const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 30;

export function SkillsInput({ defaultValue = [] }: SkillsInputProps) {
  const [skills, setSkills] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addSkill() {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_SKILL_LENGTH) {
      setMessage(`Skill must be at most ${MAX_SKILL_LENGTH} characters`);
      return;
    }

    if (skills.length >= MAX_SKILLS) {
      setMessage(`Maximum ${MAX_SKILLS} skills allowed`);
      return;
    }

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setMessage("Skill already added");
      return;
    }

    setSkills([...skills, trimmed]);
    setInput("");
    setMessage("");
    inputRef.current?.focus();
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
    setMessage("");
  }

  return (
    <div>
      <input type="hidden" name="skills" value={JSON.stringify(skills)} />
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setMessage("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add a skill..."
          maxLength={MAX_SKILL_LENGTH}
        />
        <Button type="button" onClick={addSkill} size="sm" variant="outline">
          ADD
        </Button>
      </div>
      {message && (
        <p className="text-xs font-mono text-red-500 mt-1">{message}</p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {skills.map((skill, i) => (
            <Badge key={`${skill}-${i}`} onRemove={() => removeSkill(i)}>
              {skill}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs font-mono text-foreground/40 mt-2">
        {skills.length}/{MAX_SKILLS} skills
      </p>
    </div>
  );
}
