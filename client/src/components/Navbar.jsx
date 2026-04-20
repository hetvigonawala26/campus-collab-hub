import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold ${
          isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-black">
            C
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-slate-900">Campus Collaboration Hub</div>
            <div className="text-xs text-slate-500">Find teammates. Build projects.</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Home</NavItem>
          {isAuthed ? (
            <>
              <NavItem to="/create">Create Project</NavItem>
              <NavItem to="/dashboard">Dashboard</NavItem>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <div className="hidden text-sm text-slate-600 sm:block">
                Signed in as <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>
              <Button variant="secondary" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

