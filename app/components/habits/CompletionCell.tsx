"use client";

import { Check, Plus, Minus } from "lucide-react";
import { Habit } from "@/app/lib/recurrence-types";
import { Completion } from "@/app/lib/completion-types";
import {
  getTotalCountForDate,
  isFullyCompleted,
  getCompletionProgress,
} from "@/app/lib/completion-utils";

interface CompletionCellProps {
  habit: Habit;
  date: Date;
  completions: Completion[];
  isActive: boolean;
  onToggle: (habitId: string, date: Date, increment: boolean) => void;
}

function SimpleCompletionCell({
  habit,
  date,
  completions,
  isActive,
  onToggle,
}: CompletionCellProps) {
  if (!isActive) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <span className="text-stone-300 text-xs">—</span>
      </div>
    );
  }

  const completed = isFullyCompleted(habit, completions, date);

  return (
    <button
      onClick={() => onToggle(habit.id, date, !completed)}
      className={`w-24 h-10 rounded-md transition-all ${
        completed
          ? "bg-emerald-500 text-white hover:bg-emerald-600"
          : "bg-stone-200 text-stone-400 hover:bg-stone-300"
      }`}
      title={completed ? "Mark as incomplete" : "Mark as complete"}
    >
      {completed && <Check size={20} className="mx-auto" />}
    </button>
  );
}

function CountCompletionCell({
  habit,
  date,
  completions,
  isActive,
  onToggle,
}: CompletionCellProps) {
  if (!isActive) {
    return (
      <div className="w-16 h-10 flex items-center justify-center">
        <span className="text-stone-300 text-xs">—</span>
      </div>
    );
  }

  const currentCount = getTotalCountForDate(completions, habit.id, date);
  const target = habit.target_count || 1;
  const completed = currentCount >= target;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onToggle(habit.id, date, false)}
        disabled={currentCount === 0}
        className="w-6 h-10 rounded-l-md bg-stone-200 text-stone-600 hover:bg-stone-300 disabled:bg-stone-100 disabled:text-stone-300 transition-colors flex items-center justify-center"
        title="Decrease count"
      >
        <Minus size={14} />
      </button>

      <div
        className={`w-12 h-10 flex flex-col items-center justify-center rounded-sm transition-all ${
          completed
            ? "bg-emerald-500 text-white"
            : currentCount > 0
            ? "bg-amber-400 text-white"
            : "bg-stone-200 text-stone-600"
        }`}
      >
        <span className="text-sm font-semibold">{currentCount}</span>
        <span className="text-xs opacity-75">/ {target}</span>
      </div>

      <button
        onClick={() => onToggle(habit.id, date, true)}
        className="w-6 h-10 rounded-r-md bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors flex items-center justify-center"
        title="Increase count"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CompletionCell(props: CompletionCellProps) {
  if (props.habit.completion_type === "simple") {
    return <SimpleCompletionCell {...props} />;
  } else {
    return <CountCompletionCell {...props} />;
  }
}
