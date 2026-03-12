"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCardEditor } from "@/components/dashboard/project-card-editor";
import { removeProject } from "@/actions/project";
import type { Project } from "@/lib/database.types";

interface ProjectListEditorProps {
  projects: Project[];
  profileId: string;
  userId: string;
}

export function ProjectListEditor({ projects, profileId, userId }: ProjectListEditorProps) {
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        if (editingId === project.id) {
          return (
            <ProjectCardEditor
              key={project.id}
              project={project}
              userId={userId}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <div
            key={project.id}
            className="border border-foreground/10 rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <h3 className="font-mono font-medium text-sm">{project.title}</h3>
              {project.description && (
                <p className="text-xs font-mono text-foreground/50 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              {project.url && (
                <p className="text-xs font-mono text-teal-500 mt-1 truncate max-w-xs">
                  {project.url}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(project.id)}
              >
                EDIT
              </Button>
              {confirmDeleteId === project.id ? (
                <form action={removeProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    CONFIRM
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirmDeleteId(project.id);
                    setTimeout(() => setConfirmDeleteId(null), 3000);
                  }}
                >
                  DELETE
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {showNew ? (
        <ProjectCardEditor
          userId={userId}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNew(true)}
        >
          + ADD PROJECT
        </Button>
      )}
    </div>
  );
}
