"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Note } from "../lib/note-types";
import NotesGrid from "../components/notes/NotesGrid";
import NoteConfigModal from "../components/notes/NoteConfigModal";
import { Plus } from "lucide-react";

export default function NotesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .is("project_id", null)
      .is("task_id", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
      return;
    }

    setNotes(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchNotes();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleCreateNote = async (config: {
    title: string | null;
    tags: string[] | null;
  }) => {
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: config.title,
        content: { type: "text" as const, text: "" },
        tags: config.tags,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return;
    }

    if (data) {
      router.push(`/notes/${data.id}`);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error);
      return;
    }

    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-stone-800">Notes</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Notes Grid */}
        <NotesGrid
          notes={notes}
          isLoading={isLoading}
          onDeleteNote={handleDeleteNote}
        />

        {/* Configuration Modal */}
        {isModalOpen && (
          <NoteConfigModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateNote}
          />
        )}
      </div>
    </div>
  );
}
