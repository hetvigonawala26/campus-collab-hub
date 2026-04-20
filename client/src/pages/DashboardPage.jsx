import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { api } from "../services/api";

function StatusPill({ status }) {
  const cls =
    status === "accepted"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${cls}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setActionError("");
    try {
      const d = await api.dashboard();
      setData(d);
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const created = data?.createdProjects || [];
  const sent = data?.sentApplications || [];
  const received = data?.receivedApplications || [];

  const pendingReceived = useMemo(() => received.filter((a) => a.status === "pending"), [received]);

  async function decide(appId, decision) {
    setActionError("");
    setBusyId(appId);
    try {
      if (decision === "accept") await api.accept(appId);
      else await api.reject(appId);
      await load();
    } catch (e) {
      setActionError(e.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Dashboard</div>
          <div className="text-sm text-slate-600">Manage your projects and applications.</div>
        </div>
        <div className="flex gap-2">
          <Link to="/create">
            <Button>Create project</Button>
          </Link>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <Card>
          <div className="text-sm text-rose-600">{error}</div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-12">
          <section className="md:col-span-6">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-extrabold text-slate-900">Your created projects</div>
                <Badge>{created.length}</Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {created.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    You haven’t created any projects yet.
                  </div>
                ) : (
                  created.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${p._id}`}
                          className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-700"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-slate-500">
                          Members needed: {p.membersNeeded}
                        </div>
                      </div>
                      <Link to={`/projects/${p._id}`} className="text-sm font-semibold text-indigo-700">
                        View
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-extrabold text-slate-900">Applications sent</div>
                <Badge>{sent.length}</Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {sent.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    You haven’t applied to any projects yet.
                  </div>
                ) : (
                  sent.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${a.project?._id}`}
                          className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-700"
                        >
                          {a.project?.title || "Project"}
                        </Link>
                        <div className="mt-1">
                          <StatusPill status={a.status} />
                        </div>
                      </div>
                      <Link
                        to={`/projects/${a.project?._id}`}
                        className="text-sm font-semibold text-indigo-700"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>

          <section className="md:col-span-6">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-extrabold text-slate-900">Requests received</div>
                <Badge>{received.length}</Badge>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Pending requests: <span className="font-bold text-slate-900">{pendingReceived.length}</span>
              </div>

              {actionError ? <div className="mt-3 text-sm text-rose-600">{actionError}</div> : null}

              <div className="mt-4 grid gap-3">
                {received.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    No one has applied to your projects yet.
                  </div>
                ) : (
                  received.map((a) => (
                    <div key={a._id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-slate-500">Project</div>
                          <Link
                            to={`/projects/${a.project?._id}`}
                            className="block truncate text-base font-extrabold text-slate-900 hover:text-indigo-700"
                          >
                            {a.project?.title || "Project"}
                          </Link>
                          <div className="mt-2 text-sm text-slate-500">Applicant</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {a.applicant?.name} <span className="text-slate-500">({a.applicant?.email})</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <StatusPill status={a.status} />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link to={`/projects/${a.project?._id}`}>
                          <Button variant="secondary">View project</Button>
                        </Link>
                        <Button
                          onClick={() => decide(a._id, "accept")}
                          disabled={a.status !== "pending" || busyId === a._id}
                        >
                          {busyId === a._id ? "Working..." : "Accept"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => decide(a._id, "reject")}
                          disabled={a.status !== "pending" || busyId === a._id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>
        </div>
      )}
    </main>
  );
}

