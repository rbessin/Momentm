"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Project } from "@/app/lib/project-types";
import { ArrowLeft, Calendar, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Milestone } from "@/app/lib/project-types";
import MilestoneList from "@/app/components/projects/MilestoneList";
import LinkedNotesList from "@/app/components/projects/LinkedNotesList";
import ProjectModal from "@/app/components/projects/ProjectModal";

export default function ProjectDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        router.push("/projects");
        return;
      }

      setProject(projectData);

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (milestonesError) {
        console.error("Error fetching milestones:", milestonesError);
      } else {
        setMilestones(milestonesData || []);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [projectId]);

  const updateProject = async (projectData: any) => {
    const { data, error } = await supabase
      .from("projects")
      .update({
        name: projectData.name,
        description: projectData.description,
        color: projectData.color,
        start_date: projectData.start_date,
        target_end_date: projectData.target_end_date,
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return;
    }

    if (data) {
      setProject(data);
      setShowEditModal(false);
    }
  };

  const deleteProject = async () => {
    if (
      !confirm(
        "Delete this project? This will also delete all milestones, tasks, and unlink notes.",
      )
    )
      return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      return;
    }

    router.push("/projects");
  };

  const updateStatus = async (
    newStatus: "active" | "completed" | "on-hold" | "archived",
  ) => {
    const { data, error } = await supabase
      .from("projects")
      .update({
        status: newStatus,
        actual_end_date:
          newStatus === "completed"
            ? new Date().toISOString().split("T")[0]
            : null,
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    if (data) {
      setProject(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600 text-sm">Loading project...</p>
      </div>
    );
  }

  if (!project) return null;

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-300",
    "on-hold": "bg-amber-100 text-amber-700 border-amber-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    archived: "bg-stone-100 text-stone-600 border-stone-300",
  };

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent =
    milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-stone-200 mb-6 overflow-hidden">
          {/* Color bar */}
          {project.color && (
            <div className="h-2" style={{ backgroundColor: project.color }} />
          )}

          <div className="p-6">
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/projects")}
                  className="text-stone-600 hover:text-emerald-600 transition-colors"
                  title="Back to projects"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-stone-900">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-sm text-stone-600 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteProject}
                  className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Status Dropdown */}
              <select
                value={project.status}
                onChange={(e) => updateStatus(e.target.value as any)}
                className={`px-3 py-1 text-sm rounded-lg border font-medium ${statusColors[project.status]}`}
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* Dates */}
              {project.start_date && (
                <div className="flex items-center gap-1 text-sm text-stone-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Started{" "}
                    {new Date(project.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {project.target_end_date && (
                <div className="flex items-center gap-1 text-sm text-stone-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Due{" "}
                    {new Date(project.target_end_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
              )}

              {project.actual_end_date && (
                <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Completed{" "}
                    {new Date(project.actual_end_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            {milestones.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-stone-700 mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span>
                    {completedMilestones}/{milestones.length} milestones (
                    {Math.round(progressPercent)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Milestones with nested Tasks */}
          <MilestoneList
            projectId={projectId}
            milestones={milestones}
            setMilestones={setMilestones}
          />

          {/* Project-level Notes (not task-specific) */}
          <LinkedNotesList projectId={projectId} />
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <ProjectModal
            project={project}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={updateProject}
          />
        )}
      </div>
    </div>
  );
}
