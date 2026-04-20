import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

