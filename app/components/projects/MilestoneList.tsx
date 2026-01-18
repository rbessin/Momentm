"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Milestone } from "@/app/lib/project-types";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Task } from "@/app/lib/task-types";
import { Note } from "@/app/lib/note-types";

export default function MilestoneList(props: {
  projectId: string;
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
}) {
  const { projectId, milestones, setMilestones } = props;
  const supabase = createClient();

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(),
  );
  const [milestoneTasks, setMilestoneTasks] = useState<Record<string, Task[]>>(
    {},
  );
  const [taskNotes, setTaskNotes] = useState<Record<string, Note[]>>({});
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>(
    {},
  );

  // Fetch tasks for all milestones
  useEffect(() => {
    const fetchAllTasks = async () => {
      for (const milestone of milestones) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("milestone_id", milestone.id)
          .order("created_at", { ascending: true });

        if (!error && data) {
          setMilestoneTasks((prev) => ({ ...prev, [milestone.id]: data }));

          // Fetch notes for each task
          for (const task of data) {
            const { data: notes } = await supabase
              .from("notes")
              .select("*")
              .eq("task_id", task.id)
              .order("updated_at", { ascending: false });

            if (notes) {
              setTaskNotes((prev) => ({ ...prev, [task.id]: notes }));
            }
          }
        }
      }
    };

    if (milestones.length > 0) {
      fetchAllTasks();
    }
  }, [milestones]);

  // Check if milestone should be auto-completed
  useEffect(() => {
    const checkMilestoneCompletion = async () => {
      for (const milestone of milestones) {
        const tasks = milestoneTasks[milestone.id] || [];

        if (tasks.length === 0) continue;

        const allTasksComplete = tasks.every((t) => t.completed);

        // Auto-complete milestone if all tasks are done
        if (allTasksComplete && !milestone.completed) {
          await supabase
            .from("milestones")
            .update({
              completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq("id", milestone.id);

          setMilestones(
            milestones.map((m) =>
              m.id === milestone.id
                ? {
                    ...m,
                    completed: true,
                    completed_at: new Date().toISOString(),
                  }
                : m,
            ),
          );
        }

        // Uncomplete milestone if any task is incomplete
        if (!allTasksComplete && milestone.completed) {
          await supabase
            .from("milestones")
            .update({
              completed: false,
              completed_at: null,
            })
            .eq("id", milestone.id);

          setMilestones(
            milestones.map((m) =>
              m.id === milestone.id
                ? { ...m, completed: false, completed_at: null }
                : m,
            ),
          );
        }
      }
    };

    checkMilestoneCompletion();
  }, [milestoneTasks]);

  const addMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        project_id: projectId,
        title: newMilestoneTitle.trim(),
        order_index: milestones.length,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating milestone:", error);
      return;
    }

    if (data) {
      setMilestones([...milestones, data]);
      setNewMilestoneTitle("");
      setShowAddForm(false);
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm("Delete this milestone? This will also delete all its tasks."))
      return;

    const { error } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId);

    if (error) {
      console.error("Error deleting milestone:", error);
      return;
    }

    setMilestones(milestones.filter((m) => m.id !== milestoneId));
  };

  const toggleMilestoneExpand = (milestoneId: string) => {
    setExpandedMilestones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const addTask = async (milestoneId: string) => {
    const title = newTaskTitles[milestoneId];
    if (!title || !title.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        milestone_id: milestoneId,
        title: title.trim(),
        priority: "medium",
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return;
    }

    if (data) {
      setMilestoneTasks((prev) => ({
        ...prev,
        [milestoneId]: [...(prev[milestoneId] || []), data],
      }));
      setNewTaskTitles((prev) => ({ ...prev, [milestoneId]: "" }));
    }
  };

  const toggleTask = async (taskId: string, milestoneId: string) => {
    const task = milestoneTasks[milestoneId]?.find((t) => t.id === taskId);
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
      setMilestoneTasks((prev) => ({
        ...prev,
        [milestoneId]: prev[milestoneId].map((t) =>
          t.id === data.id ? data : t,
        ),
      }));
    }
  };

  const deleteTask = async (taskId: string, milestoneId: string) => {
    if (!confirm("Delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    setMilestoneTasks((prev) => ({
      ...prev,
      [milestoneId]: prev[milestoneId].filter((t) => t.id !== taskId),
    }));
  };

  const priorityColors = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-stone-100 text-stone-600",
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-emerald-700">
          Milestones ({completedCount}/{milestones.length})
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Milestone
        </button>
      </div>

      {/* Add Milestone Form */}
      {showAddForm && (
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addMilestone()}
              placeholder="Enter milestone title..."
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
            <button
              onClick={addMilestone}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewMilestoneTitle("");
              }}
              className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-stone-600">No milestones yet</p>
          <p className="text-xs text-stone-500 mt-1">
            Break this project into milestones to track progress
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200">
          {milestones.map((milestone) => {
            const tasks = milestoneTasks[milestone.id] || [];
            const isExpanded = expandedMilestones.has(milestone.id);
            const completedTasks = tasks.filter((t) => t.completed).length;

            return (
              <div key={milestone.id} className="group">
                {/* Milestone Header */}
                <div className="p-3 hover:bg-stone-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleMilestoneExpand(milestone.id)}
                      className="mt-0.5 flex-shrink-0 text-stone-400 hover:text-stone-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Completion Status */}
                    <div className="mt-0.5 flex-shrink-0">
                      {milestone.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleMilestoneExpand(milestone.id)}
                    >
                      <div
                        className={`text-sm font-medium ${milestone.completed ? "line-through text-stone-500" : "text-stone-900"}`}
                      >
                        {milestone.title}
                      </div>

                      {milestone.description && (
                        <p
                          className={`text-xs mt-1 ${milestone.completed ? "text-stone-400" : "text-stone-600"}`}
                        >
                          {milestone.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1">
                        {tasks.length > 0 && (
                          <span className="text-xs text-stone-600">
                            {completedTasks}/{tasks.length} tasks
                          </span>
                        )}
                        {milestone.target_date && (
                          <div className="flex items-center gap-1 text-xs text-stone-600">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Due{" "}
                              {new Date(
                                milestone.target_date,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMilestone(milestone.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: Tasks */}
                {isExpanded && (
                  <div className="bg-stone-50 border-t border-stone-200">
                    {/* Add Task Form */}
                    <div className="p-3 pl-12 border-b border-stone-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTaskTitles[milestone.id] || ""}
                          onChange={(e) =>
                            setNewTaskTitles((prev) => ({
                              ...prev,
                              [milestone.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && addTask(milestone.id)
                          }
                          placeholder="Add task to this milestone..."
                          className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                        <button
                          onClick={() => addTask(milestone.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Tasks List */}
                    {tasks.length === 0 ? (
                      <div className="p-6 pl-12 text-center">
                        <p className="text-xs text-stone-500">
                          No tasks yet - add tasks to complete this milestone
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-200">
                        {tasks.map((task) => {
                          const notes = taskNotes[task.id] || [];

                          return (
                            <div
                              key={task.id}
                              className="pl-12 pr-3 py-2 hover:bg-stone-100/50 transition-colors group/task"
                            >
                              <div className="flex items-start gap-3">
                                {/* Task Checkbox */}
                                <button
                                  onClick={() =>
                                    toggleTask(task.id, milestone.id)
                                  }
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-stone-400 hover:text-emerald-600 transition-colors" />
                                  )}
                                </button>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm ${task.completed ? "line-through text-stone-500" : "text-stone-900"}`}
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

                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded ${priorityColors[task.priority]}`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.due_date && (
                                      <span className="text-xs text-stone-600">
                                        Due{" "}
                                        {new Date(
                                          task.due_date,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    )}
                                    {notes.length > 0 && (
                                      <span className="flex items-center gap-1 text-xs text-purple-600">
                                        <FileText className="w-3 h-3" />
                                        {notes.length}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Task Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() =>
                                      deleteTask(task.id, milestone.id)
                                    }
                                    className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const priorityColors = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-stone-100 text-stone-600",
};
