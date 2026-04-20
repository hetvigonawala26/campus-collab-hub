import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Card>
          <div className="text-xl font-extrabold text-slate-900">Page not found</div>
          <div className="mt-2 text-sm text-slate-600">
            The page you’re looking for doesn’t exist.
          </div>
          <div className="mt-5">
            <Link to="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
              Back to home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

