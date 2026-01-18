import { Note } from "@/app/lib/note-types";
import NoteCard from "./NoteCard";

export default function NotesGrid(props: {
  notes: Note[];
  isLoading: boolean;
  onDeleteNote: (noteId: string) => void;
}) {
  const { notes, isLoading, onDeleteNote } = props;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center">
        <p className="text-stone-600 text-sm">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center">
        <h3 className="text-lg font-medium text-stone-800 mb-2">
          No notes yet
        </h3>
        <p className="text-stone-600 text-sm">
          Create your first note to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={() => onDeleteNote(note.id)}
        />
      ))}
    </div>
  );
}
