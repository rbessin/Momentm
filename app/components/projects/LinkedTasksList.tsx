"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Task } from "@/app/lib/task-types";
import { CheckCircle2, Circle, ExternalLink, Plus } from "lucide-react";

export default function LinkedTasksList(props: { projectId: string }) {
  const { projectId } = props;
  const supabase = createClient();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
      setIsLoading(false);
    };

    fetchTasks();
  }, [projectId]);

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
      setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
    }
  };

  const priorityColors = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-stone-100 text-stone-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-blue-700">
          Tasks ({tasks.filter((t) => t.completed).length}/{tasks.length})
        </h2>
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center gap-1 px-3 py-1 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-xs"
        >
          <ExternalLink className="w-3 h-3" />
          View All
        </button>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="p-8 text-center text-stone-600 text-sm">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-stone-600">
            No tasks linked to this project
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 max-h-80 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-400 hover:text-emerald-600 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${task.completed ? "line-through text-stone-500" : "text-stone-900"}`}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-stone-600">
                        Due{" "}
                        {new Date(task.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
