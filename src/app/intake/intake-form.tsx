"use client";

import { useActionState } from "react";

import { submitIntake, type IntakeState } from "./actions";

const initialState: IntakeState = { error: null };

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(
    submitIntake,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col items-start gap-3">
      <label htmlFor="complaint">Presenting complaint</label>
      <textarea
        id="complaint"
        name="complaint"
        rows={6}
        className="w-full border p-2"
      />
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-2">
        Submit
      </button>
    </form>
  );
}
