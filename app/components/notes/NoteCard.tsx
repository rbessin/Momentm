"use client";

import { useRouter } from "next/navigation";
import { Note } from "@/app/lib/note-types";
import { Trash2, FileText } from "lucide-react";

export default function NoteCard(props: { note: Note; onDelete: () => void }) {
  const { note, onDelete } = props;
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {/* Type indicator */}
      <div className="absolute top-3 left-3">
        <FileText className="w-4 h-4 text-emerald-600" />
      </div>

      {/* Delete button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this note?")) {
              onDelete();
            }
          }}
          className="p-1.5 bg-white rounded hover:bg-red-50 shadow-sm border border-stone-200"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Title */}
      {note.title && (
        <h3 className="font-medium text-stone-800 mb-2 pr-8 mt-6 text-sm">
          {note.title}
        </h3>
      )}

      {/* Content preview */}
      <div
        className="text-stone-600 text-xs line-clamp-4 mt-2"
        dangerouslySetInnerHTML={{
          __html: note.content.text?.substring(0, 150) || "Empty note",
        }}
      />

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-stone-400 mt-3">
        {new Date(note.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
}
