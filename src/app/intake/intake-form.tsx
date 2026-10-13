"use client";

import { useActionState } from "react";

import {
  durationOptions,
  emptyIntakeValues,
  intakeFieldLabels,
  type IntakeField,
} from "@/domain/case";

import { submitIntake, type IntakeState } from "./actions";

const initialState: IntakeState = { errors: {}, values: emptyIntakeValues };

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(
    submitIntake,
    initialState,
  );

  // Decision D3 and plan 4.4: the message is associated with its control, so
  // assistive technology reads the omission against the field it concerns.
  // Phase 10 owns how any of this looks.
  const describedBy = (field: IntakeField) =>
    state.errors[field] ? `${field}-error` : undefined;

  const error = (field: IntakeField) =>
    state.errors[field] ? (
      <p id={`${field}-error`} role="alert">
        {state.errors[field]}
      </p>
    ) : null;

  return (
    <form action={formAction} className="mt-8 flex flex-col items-start gap-6">
      <div className="flex w-full flex-col gap-1">
        <label htmlFor="complaint">{intakeFieldLabels.complaint}</label>
        <textarea
          id="complaint"
          name="complaint"
          rows={6}
          defaultValue={state.values.complaint}
          aria-describedby={describedBy("complaint")}
          className="w-full border p-2"
        />
        {error("complaint")}
      </div>

      <div className="flex w-full flex-col gap-1">
        <label htmlFor="duration">{intakeFieldLabels.duration}</label>
        {/* React resets the form after an action, and a <select> is restored to
            the selection it was mounted with rather than to its current
            defaultValue — unlike an input or textarea, whose defaultValue
            attribute React keeps in step. The key remounts it when the
            submitted duration changes, which is what makes a failed submit
            keep the selection. */}
        <select
          key={state.values.duration}
          id="duration"
          name="duration"
          defaultValue={state.values.duration}
          aria-describedby={describedBy("duration")}
          className="border p-2"
        >
          <option value="">Not recorded</option>
          {durationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error("duration")}
      </div>

      <div className="flex w-full flex-col gap-1">
        <label htmlFor="requirementRevisions">
          {intakeFieldLabels.requirementRevisions}
        </label>
        {/* Decision D5: a text input, not type="number". The server must not
            trust the client's validation, and a number input would stop the
            rejected shapes from ever reaching the schema that rejects them. */}
        <input
          id="requirementRevisions"
          name="requirementRevisions"
          type="text"
          inputMode="numeric"
          defaultValue={state.values.requirementRevisions}
          aria-describedby={describedBy("requirementRevisions")}
          className="border p-2"
        />
        {error("requirementRevisions")}
      </div>

      <div className="flex w-full flex-col gap-1">
        <label htmlFor="priorEpisodes">{intakeFieldLabels.priorEpisodes}</label>
        <input
          id="priorEpisodes"
          name="priorEpisodes"
          type="text"
          inputMode="numeric"
          defaultValue={state.values.priorEpisodes}
          aria-describedby={describedBy("priorEpisodes")}
          className="border p-2"
        />
        {error("priorEpisodes")}
      </div>

      <div className="flex w-full flex-col gap-1">
        <label htmlFor="humanSaid">{intakeFieldLabels.humanSaid}</label>
        <textarea
          id="humanSaid"
          name="humanSaid"
          rows={3}
          defaultValue={state.values.humanSaid}
          aria-describedby={describedBy("humanSaid")}
          className="w-full border p-2"
        />
        {error("humanSaid")}
      </div>

      <div className="flex w-full flex-col gap-1">
        <label htmlFor="humanMeant">{intakeFieldLabels.humanMeant}</label>
        <textarea
          id="humanMeant"
          name="humanMeant"
          rows={3}
          defaultValue={state.values.humanMeant}
          aria-describedby={describedBy("humanMeant")}
          className="w-full border p-2"
        />
        {error("humanMeant")}
      </div>

      <button type="submit" disabled={pending} className="border px-3 py-2">
        Submit
      </button>
    </form>
  );
}
