"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Task } from "../lib/task-types";
import TaskList from "../components/tasks/TaskList";
import TaskCreator from "../components/tasks/TaskCreator";
import TaskModal from "../components/tasks/TaskModal";
import { Search, SlidersHorizontal, Eye, EyeOff } from "lucide-react";

export default function TasksPage() {
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("due_date");

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .is("project_id", null) // Only standalone tasks for now
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTasks();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || "medium",
        due_date: taskData.due_date,
        start_date: taskData.start_date,
        tags: taskData.tags,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return;
    }

    if (data) {
      setTasks((prev) => [data, ...prev]);
    }
  };

  const updateTask = async (taskData: Partial<Task> & { id: string }) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.due_date,
        start_date: taskData.start_date,
        tags: taskData.tags,
      })
      .eq("id", taskData.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      setEditingTask(null);
    }
  };

  const toggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling task:", error);
      return;
    }

    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (!showCompleted && task.completed) return false;
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      if (selectedTag && (!task.tags || !task.tags.includes(selectedTag)))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "due_date": {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        }
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])));

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold text-stone-900">Tasks</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {showCompleted ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                Completed
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showFilters
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {allTags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="created">Date Created</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add */}
        <TaskCreator onSave={createTask} />

        {/* Tasks List */}
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          showCompleted={showCompleted}
          onToggleComplete={toggleComplete}
          onEdit={setEditingTask}
          onDelete={deleteTask}
        />

        {/* Edit Modal */}
        {editingTask && (
          <TaskModal
            task={editingTask}
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSave={updateTask}
          />
        )}
      </div>
    </div>
  );
}
