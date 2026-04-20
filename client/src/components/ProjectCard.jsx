import React from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import Badge from "./Badge";

export default function ProjectCard({ project }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/projects/${project._id}`}
            className="block truncate text-lg font-extrabold text-slate-900 hover:text-indigo-700"
          >
            {project.title}
          </Link>
          <div className="mt-1 text-xs text-slate-500">
            By <span className="font-semibold text-slate-700">{project.createdBy?.name}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-slate-500">Members needed</div>
          <div className="text-sm font-extrabold text-slate-900">{project.membersNeeded}</div>
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-slate-700">{project.description}</p>

      <div className="flex flex-wrap gap-2">
        {(project.requiredSkills || []).slice(0, 6).map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
    </Card>
  );
}

