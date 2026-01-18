"use client";

import { useRouter } from "next/navigation";
import { Project } from "@/app/lib/project-types";
import { Trash2, Calendar, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function ProjectCard(props: {
  project: Project;
  onDelete: (projectId: string) => void;
}) {
  const { project, onDelete } = props;
  const router = useRouter();
  const supabase = createClient();

  const [milestonesCount, setMilestonesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("id, completed")
        .eq("project_id", project.id);

      if (milestones) {
        setMilestonesCount(milestones.length);
        setCompletedMilestones(milestones.filter((m) => m.completed).length);
      }

      // Fetch tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", project.id);

      if (tasks) {
        setTasksCount(tasks.length);
      }
    };

    fetchCounts();
  }, [project.id]);

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-300",
    "on-hold": "bg-amber-100 text-amber-700 border-amber-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    archived: "bg-stone-100 text-stone-600 border-stone-300",
  };

  const progressPercent =
    milestonesCount > 0 ? (completedMilestones / milestonesCount) * 100 : 0;

  const isOverdue =
    project.target_end_date &&
    project.status === "active" &&
    new Date(project.target_end_date) < new Date();

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {/* Color indicator */}
      {project.color && (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
          style={{ backgroundColor: project.color }}
        />
      )}

      {/* Delete button */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="p-1.5 bg-white rounded hover:bg-red-50 shadow-sm border border-stone-200"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-900 text-base pr-8">
            {project.name}
          </h3>
        </div>

        {project.description && (
          <p className="text-sm text-stone-600 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-1 text-xs rounded border ${statusColors[project.status]}`}
          >
            {project.status === "on-hold"
              ? "On Hold"
              : project.status.charAt(0).toUpperCase() +
                project.status.slice(1)}
          </span>

          {isOverdue && (
            <span className="px-2 py-1 text-xs rounded border bg-red-100 text-red-700 border-red-300">
              Overdue
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {milestonesCount > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
              <span>Progress</span>
              <span className="font-medium">
                {completedMilestones}/{milestonesCount} milestones
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-stone-600">
          {project.target_end_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Due{" "}
                {new Date(project.target_end_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {tasksCount > 0 && (
            <div className="flex items-center gap-1">
              <FolderKanban className="w-3 h-3" />
              <span>{tasksCount} tasks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
