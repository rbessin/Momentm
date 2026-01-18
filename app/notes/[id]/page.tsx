"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Note } from "@/app/lib/note-types";
import RichTextEditor from "@/app/components/notes/RichTextEditor";
import { ArrowLeft, Save, Clock } from "lucide-react";

export default function EditNotePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const contentRef = useRef<string>("");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (error) {
        console.error("Error fetching note:", error);
        router.push("/notes");
        return;
      }

      setNote(data);
      contentRef.current = data.content.text || "";
      setIsLoading(false);
    };

    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    autoSaveTimerRef.current = setTimeout(
      () => {
        handleSave();
      },
      3 * 60 * 1000,
    );

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges]);

  const handleContentChange = (content: string) => {
    contentRef.current = content;
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("notes")
      .update({
        content: { type: "text" as const, text: contentRef.current },
      })
      .eq("id", noteId);

    if (error) {
      console.error("Error saving note:", error);
      setIsSaving(false);
      return;
    }

    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-800 text-sm">Loading note...</p>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="h-screen bg-stone-50 flex flex-col">
      {/* Top bar with green accent */}
      <div className="bg-white border-b-2 border-emerald-500 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/notes")}
              className="text-stone-700 hover:text-emerald-600 transition-colors"
              title="Back to notes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-medium text-stone-900">
                {note.title || "Untitled"}
              </h1>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <Clock className="w-3 h-3 text-emerald-600" />
              {isSaving ? (
                <span className="text-emerald-600 font-medium">Saving...</span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              ) : hasUnsavedChanges ? (
                <span className="text-amber-600 font-medium">
                  Unsaved changes
                </span>
              ) : (
                <span className="text-emerald-600">All changes saved</span>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors font-medium
                ${
                  hasUnsavedChanges
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }
              `}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor area - Now with proper height for scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-6">
          <RichTextEditor
            initialContent={note.content.text || ""}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
