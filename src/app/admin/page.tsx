"use client";

import { useState } from "react";
import { FolderKanban, MessageSquareQuote, Plus } from "lucide-react";
import { ProjectForm } from "./components/project-form";
import { ProjectList } from "./components/project-list";
import { TestimonialForm } from "./components/testimonial-form";
import { TestimonialList } from "./components/testimonial-list";
import type { Project, Testimonial } from "@/types";

type Tab = "projects" | "testimonials";
type Action = "list" | "create" | "edit";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("projects");
  const [action, setAction] = useState<Action>("list");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setAction("edit");
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setAction("edit");
  };

  const handleBack = () => {
    setAction("list");
    setEditingProject(null);
    setEditingTestimonial(null);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setAction("create");
  };

  const handleCreateTestimonial = () => {
    setEditingTestimonial(null);
    setAction("create");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-graphite-900">
            Dashboard
          </h1>
          <p className="text-graphite-500 mt-1">
            Gerencie os projetos e depoimentos da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex rounded-sm border border-graphite-200 overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => { setTab("projects"); handleBack(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors flex-1 sm:flex-initial ${
                tab === "projects"
                  ? "bg-graphite-900 text-white"
                  : "bg-white text-graphite-600 hover:bg-graphite-50"
              }`}
            >
              <FolderKanban size={16} />
              Projetos
            </button>
            <button
              onClick={() => { setTab("testimonials"); handleBack(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors flex-1 sm:flex-initial ${
                tab === "testimonials"
                  ? "bg-graphite-900 text-white"
                  : "bg-white text-graphite-600 hover:bg-graphite-50"
              }`}
            >
              <MessageSquareQuote size={16} />
              Depoimentos
            </button>
          </div>
        </div>
      </div>

      {tab === "projects" && (
        <div>
          {action === "list" ? (
            <ProjectList onCreate={handleCreateProject} onEdit={handleEditProject} />
          ) : (
            <ProjectForm
              onBack={handleBack}
              existingProject={editingProject}
            />
          )}
        </div>
      )}

      {tab === "testimonials" && (
        <div>
          {action === "list" ? (
            <TestimonialList onCreate={handleCreateTestimonial} onEdit={handleEditTestimonial} />
          ) : (
            <TestimonialForm
              onBack={handleBack}
              existingTestimonial={editingTestimonial}
            />
          )}
        </div>
      )}
    </div>
  );
}
