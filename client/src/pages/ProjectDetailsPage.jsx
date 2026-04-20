import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatters";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getProject(id);
      setProject(data.project);
    } catch (e) {
      setError(e.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = useMemo(() => {
    if (!user || !project) return false;
    const ownerId = project.createdBy?._id || project.createdBy?.id || project.createdBy;
    return ownerId?.toString?.() === user.id?.toString?.();
  }, [user, project]);

  async function onApply() {
    setActionError("");
    setBusy(true);
    try {
      await api.apply(id);
      navigate("/dashboard");
    } catch (e) {
      setActionError(e.message || "Failed to apply");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setActionError("");
    setBusy(true);
    try {
      await api.deleteProject(id);
      navigate("/");
    } catch (e) {
      setActionError(e.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ) : error ? (
        <Card>
          <div className="text-sm text-rose-600">{error}</div>
          <div className="mt-4">
            <Link to="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
              Back to feed
            </Link>
          </div>
        </Card>
      ) : !project ? null : (
        <div className="grid gap-6 md:grid-cols-12">
          <section className="md:col-span-8">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold text-slate-900">{project.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    By{" "}
                    <span className="font-semibold text-slate-800">
                      {project.createdBy?.name}
                    </span>{" "}
                    • Posted {formatDate(project.createdAt)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">Members needed</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {project.membersNeeded}
                  </div>
                </div>
              </div>

              <div className="mt-5 whitespace-pre-wrap text-sm text-slate-700">
                {project.description}
              </div>

              <div className="mt-5">
                <div className="text-sm font-bold text-slate-900">Required skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(project.requiredSkills || []).length ? (
                    project.requiredSkills.map((s) => <Badge key={s}>{s}</Badge>)
                  ) : (
                    <div className="text-sm text-slate-600">No skills specified.</div>
                  )}
                </div>
              </div>
            </Card>
          </section>

          <aside className="md:col-span-4">
            <Card>
              <div className="text-sm font-extrabold text-slate-900">Actions</div>
              <div className="mt-1 text-sm text-slate-600">
                Apply to join, or manage your post if you’re the owner.
              </div>

              {actionError ? <div className="mt-3 text-sm text-rose-600">{actionError}</div> : null}

              <div className="mt-4 grid gap-2">
                {isAuthed ? (
                  isOwner ? (
                    <>
                      <Button variant="danger" onClick={onDelete} disabled={busy}>
                        {busy ? "Deleting..." : "Delete project"}
                      </Button>
                      <div className="text-xs text-slate-500">
                        Editing UI can be added next; update endpoint already exists.
                      </div>
                    </>
                  ) : (
                    <Button onClick={onApply} disabled={busy}>
                      {busy ? "Applying..." : "Apply to join"}
                    </Button>
                  )
                ) : (
                  <Link to="/login">
                    <Button className="w-full">Login to apply</Button>
                  </Link>
                )}
              </div>
            </Card>

            <Card className="mt-4">
              <div className="text-sm font-extrabold text-slate-900">Team</div>
              <div className="mt-3 grid gap-2">
                {(project.teamMembers || []).map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                  >
                    <div className="text-sm font-semibold text-slate-900">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      )}
    </main>
  );
}

