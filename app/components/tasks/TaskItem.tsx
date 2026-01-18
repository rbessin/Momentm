"use client";

import { Task } from "@/app/lib/task-types";
import { Edit2, Trash2, Calendar, Tag } from "lucide-react";

export default function TaskItem(props: {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const { task, onToggleComplete, onEdit, onDelete } = props;

  const priorityColors = {
    urgent: "bg-red-100 text-red-700 border-red-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    medium: "bg-blue-100 text-blue-700 border-blue-300",
    low: "bg-stone-100 text-stone-600 border-stone-300",
  };

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <div className="p-3 hover:bg-stone-50 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.completed
              ? "bg-emerald-600 border-emerald-600"
              : "border-stone-300 hover:border-emerald-500"
          }`}
        >
          {task.completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium ${task.completed ? "line-through text-stone-500" : "text-stone-900"}`}
          >
            {task.title}
          </div>

          {task.description && (
            <p
              className={`text-xs mt-1 ${task.completed ? "text-stone-400" : "text-stone-600"}`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 text-xs rounded border ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>

            {/* Due Date */}
            {task.due_date && (
              <span
                className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-stone-600"}`}
              >
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-stone-400" />
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-stone-500">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
