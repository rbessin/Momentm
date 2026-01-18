"use client";

import { useState, useEffect } from "react";
import { Project } from "@/app/lib/project-types";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectModal from "../components/projects/ProjectModal";
import { Plus, Search } from "lucide-react";

export default function ProjectsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "active" | "completed" | "on-hold" | "archived"
  >("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return;
    }

    setProjects(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchProjects();
      setIsLoading(false);
    };
    loadData();
  }, [statusFilter]);

  const createProject = async (projectData: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectData.name,
        description: projectData.description,
        color: projectData.color,
        status: "active",
        start_date: projectData.start_date,
        target_end_date: projectData.target_end_date,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return;
    }

    if (data) {
      setProjects((prev) => [data, ...prev]);
      setShowModal(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Delete this project? This will also delete all associated milestones and unlink tasks.",
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

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  // Filter and sort
  const filteredProjects = projects
    .filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "due_date":
          if (!a.target_end_date && !b.target_end_date) return 0;
          if (!a.target_end_date) return 1;
          if (!b.target_end_date) return -1;
          return (
            new Date(a.target_end_date).getTime() -
            new Date(b.target_end_date).getTime()
          );
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold text-stone-900">Projects</h1>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("on-hold")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === "on-hold"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  On Hold
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === "completed"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter("archived")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === "archived"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Archived
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="created">Date Created</option>
              <option value="name">Name (A-Z)</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <ProjectGrid
          projects={filteredProjects}
          isLoading={isLoading}
          onDelete={deleteProject}
        />

        {/* Create Modal */}
        {showModal && (
          <ProjectModal
            project={null}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={createProject}
          />
        )}
      </div>
    </div>
  );
}
