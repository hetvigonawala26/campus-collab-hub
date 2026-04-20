import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import TextField from "../components/TextField";
import Card from "../components/Card";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listProjects();
      setProjects(data.projects || []);
    } catch (e) {
      setError(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((p) => {
      const skills = (p.requiredSkills || []).join(" ").toLowerCase();
      return (
        (p.title || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query) ||
        skills.includes(query) ||
        (p.createdBy?.name || "").toLowerCase().includes(query)
      );
    });
  }, [projects, q]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-12">
        <section className="md:col-span-4">
          <Card>
            <div className="text-lg font-extrabold text-slate-900">Discover projects</div>
            <div className="mt-1 text-sm text-slate-600">
              Browse student ideas and apply to join a team.
            </div>
            <div className="mt-4">
              <TextField
                label="Search"
                placeholder="Title, skill, creator…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
          </Card>
        </section>

        <section className="md:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-xl font-extrabold text-slate-900">Project Feed</div>
              <div className="text-sm text-slate-600">
                {filtered.length} project{filtered.length === 1 ? "" : "s"}
              </div>
            </div>
            <button
              onClick={load}
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <div className="text-sm text-slate-700">No projects found.</div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

