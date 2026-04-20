import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import TextField from "../components/TextField";
import TextArea from "../components/TextArea";
import Button from "../components/Button";
import { api } from "../services/api";

function parseSkills(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [membersNeeded, setMembersNeeded] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        requiredSkills: parseSkills(skills),
        membersNeeded: Number(membersNeeded)
      };
      const data = await api.createProject(payload);
      navigate(`/projects/${data.project._id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="text-xl font-extrabold text-slate-900">Create a project</div>
          <div className="mt-1 text-sm text-slate-600">
            Share your idea and let teammates apply to join.
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={120}
              placeholder="e.g., StudyBuddy: AI-powered study planner"
            />
            <TextArea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
              placeholder="What are you building? What help do you need? What’s the timeline?"
            />
            <TextField
              label="Required skills (comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node, Figma, Python, ML"
            />
            <TextField
              label="Number of members needed"
              type="number"
              min={1}
              max={50}
              value={membersNeeded}
              onChange={(e) => setMembersNeeded(e.target.value)}
              required
            />
            {error ? <div className="text-sm text-rose-600">{error}</div> : null}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create project"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

