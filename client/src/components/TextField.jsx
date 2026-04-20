import React from "react";

export default function TextField({
  label,
  error,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <input
        className={`w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 ${inputClassName}`}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  );
}

