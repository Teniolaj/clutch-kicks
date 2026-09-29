"use client";

import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 bg-ink text-ink-invert border-2 border-ink font-sans text-sm font-bold uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-alt px-4">
      <div className="w-full max-w-sm bg-bg border-2 border-line-strong p-8">
        <span className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">
          Clutch Kicks
        </span>
        <h1 className="font-display uppercase text-3xl leading-none mt-1">Admin</h1>

        <form action={formAction} className="flex flex-col gap-4 mt-8">
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs font-bold uppercase tracking-wide">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 px-3 border-2 border-line bg-bg font-sans text-sm focus:outline-none focus:border-line-strong"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs font-bold uppercase tracking-wide">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 px-3 border-2 border-line bg-bg font-sans text-sm focus:outline-none focus:border-line-strong"
            />
          </label>

          {state.error && (
            <p role="alert" className="font-sans text-xs text-red">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
