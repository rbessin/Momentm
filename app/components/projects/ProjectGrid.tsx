import { Project } from "@/app/lib/project-types";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid(props: {
  projects: Project[];
  isLoading: boolean;
  onDelete: (projectId: string) => void;
}) {
  const { projects, isLoading, onDelete } = props;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
        <p className="text-stone-600 text-sm">Loading projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-stone-800 mb-2">
          No projects yet
        </h3>
        <p className="text-stone-600 text-sm">
          Create your first project to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
