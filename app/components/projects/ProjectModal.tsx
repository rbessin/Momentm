"use client";

import { useState, useEffect } from "react";
import { Project } from "@/app/lib/project-types";
import { X } from "lucide-react";

export default function ProjectModal(props: {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
}) {
  const { project, isOpen, onClose, onSave } = props;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#10b981");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setColor(project.color || "#10b981");
      setStartDate(project.start_date || "");
      setTargetEndDate(project.target_end_date || "");
    } else {
      setName("");
      setDescription("");
      setColor("#10b981");
      setStartDate("");
      setTargetEndDate("");
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a project name");
      return;
    }

    const projectData = project
      ? {
          id: project.id,
          name: name.trim(),
          description: description.trim() || null,
          color,
          start_date: startDate || null,
          target_end_date: targetEndDate || null,
        }
      : {
          name: name.trim(),
          description: description.trim() || null,
          color,
          start_date: startDate || null,
          target_end_date: targetEndDate || null,
        };

    onSave(projectData);
  };

  const predefinedColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            {project ? "Edit Project" : "Create Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Website Redesign"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Description{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this project..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Color
            </label>
            <div className="flex items-center gap-2">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === presetColor
                      ? "ring-2 ring-emerald-600 ring-offset-2"
                      : "hover:ring-2 hover:ring-stone-300"
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Start Date{" "}
                <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Target End Date{" "}
                <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
            >
              {project ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
