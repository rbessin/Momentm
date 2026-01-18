"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Note } from "@/app/lib/note-types";
import { FileText, ExternalLink } from "lucide-react";

export default function LinkedNotesList(props: { projectId: string }) {
  const { projectId } = props;
  const supabase = createClient();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      // Only fetch project-level notes (not task-specific)
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", projectId)
        .is("task_id", null) // Only general project notes
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
      } else {
        setNotes(data || []);
      }
      setIsLoading(false);
    };

    fetchNotes();
  }, [projectId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-purple-700">
          Project Notes ({notes.length})
        </h2>
        <button
          onClick={() => router.push("/notes")}
          className="flex items-center gap-1 px-3 py-1 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors text-xs"
        >
          <ExternalLink className="w-3 h-3" />
          View All
        </button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="p-8 text-center text-stone-600 text-sm">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm text-stone-600">No project notes yet</p>
          <p className="text-xs text-stone-500 mt-1">
            General notes about this project
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 max-h-80 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="p-3 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900">
                    {note.title || "Untitled"}
                  </div>
                  {note.content.text && (
                    <div
                      className="text-xs text-stone-600 line-clamp-2 mt-1"
                      dangerouslySetInnerHTML={{
                        __html: note.content.text.substring(0, 100),
                      }}
                    />
                  )}
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
