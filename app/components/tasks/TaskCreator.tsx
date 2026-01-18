"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Task } from "@/app/lib/task-types";
import TaskModal from "./TaskModal";

export default function TaskCreator(props: {
  onSave: (task: Partial<Task>) => void;
}) {
  const { onSave } = props;
  const [quickTitle, setQuickTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onSave({
      title: quickTitle.trim(),
      priority: "medium",
    });

    setQuickTitle("");
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 mb-4">
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add new task (e.g., Review project proposal)"
            className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm transition-colors"
            title="Advanced options"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </form>
      </div>

      {showModal && (
        <TaskModal
          task={null}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={(taskData) => {
            onSave(taskData);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
