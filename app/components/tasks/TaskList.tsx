"use client";

import { Task } from "@/app/lib/task-types";
import TaskItem from "./TaskItem";

export default function TaskList(props: {
  tasks: Task[];
  isLoading: boolean;
  showCompleted: boolean;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const {
    tasks,
    isLoading,
    showCompleted,
    onToggleComplete,
    onEdit,
    onDelete,
  } = props;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
        <p className="text-stone-600 text-sm">Loading tasks...</p>
      </div>
    );
  }

  // Group tasks by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const overdue = activeTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < today,
  );
  const todayTasks = activeTasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date).toDateString() === today.toDateString(),
  );
  const thisWeek = activeTasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) > today &&
      new Date(t.due_date) < weekFromNow,
  );
  const later = activeTasks.filter(
    (t) => t.due_date && new Date(t.due_date) >= weekFromNow,
  );
  const noDueDate = activeTasks.filter((t) => !t.due_date);

  const sections = [
    {
      title: "Overdue",
      tasks: overdue,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Today",
      tasks: todayTasks,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "This Week",
      tasks: thisWeek,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Later",
      tasks: later,
      color: "text-stone-600",
      bgColor: "bg-stone-50",
    },
    {
      title: "No Due Date",
      tasks: noDueDate,
      color: "text-stone-500",
      bgColor: "bg-stone-50",
    },
  ];

  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-stone-800 mb-2">
          No tasks yet
        </h3>
        <p className="text-stone-600 text-sm">
          Add a task above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Tasks Sections */}
      {sections.map(
        (section) =>
          section.tasks.length > 0 && (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
            >
              <div
                className={`${section.bgColor} px-4 py-2 border-b border-stone-200`}
              >
                <h2 className={`text-sm font-semibold ${section.color}`}>
                  {section.title} ({section.tasks.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-200">
                {section.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ),
      )}

      {/* Completed Tasks */}
      {showCompleted && completedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-stone-600">
              Completed ({completedTasks.length})
            </h2>
          </div>
          <div className="divide-y divide-stone-200">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
