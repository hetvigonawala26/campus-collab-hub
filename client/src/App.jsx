import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Campus Collaboration Hub
        </div>
      </footer>
    </div>
  );
}

