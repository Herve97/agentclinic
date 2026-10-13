import { durationOptions } from "./case";

// The read side of a case. `case.ts` is the intake boundary — the schema, the
// field list, the labels; this file is everything the chart note derives from a
// stored row (decision D2).

type DurationOption = (typeof durationOptions)[number];

export type Chronicity = "acute" | "subacute" | "chronic" | "indeterminate";
export type EpisodeHistory =
  "first" | "recurrent" | "established" | "indeterminate";
export type RevisionBurden = "none" | "moderate" | "marked" | "indeterminate";

export const chronicities: readonly Chronicity[] = [
  "acute",
  "subacute",
  "chronic",
  "indeterminate",
];
export const episodeHistories: readonly EpisodeHistory[] = [
  "first",
  "recurrent",
  "established",
  "indeterminate",
];
export const revisionBurdens: readonly RevisionBurden[] = [
  "none",
  "moderate",
  "marked",
  "indeterminate",
];

// Typed as Record<DurationOption, Chronicity>, so adding a sixth duration
// option in src/domain/case.ts fails to compile here rather than silently
// mapping to "indeterminate" (plan 1.2).
const chronicityByDuration: Record<DurationOption, Chronicity> = {
  "Within a single session": "acute",
  "Across several sessions today": "acute",
  "Several days": "subacute",
  "Several weeks": "subacute",
  "Longer than a month": "chronic",
};

export const chronicityLabels: Record<Chronicity, string> = {
  acute: "Acute",
  subacute: "Subacute",
  chronic: "Chronic",
  indeterminate: "Not determinable from the record",
};

export const episodeHistoryLabels: Record<EpisodeHistory, string> = {
  first: "First presentation",
  recurrent: "Recurrent",
  established: "Established pattern",
  indeterminate: "Not determinable from the record",
};

export const revisionBurdenLabels: Record<RevisionBurden, string> = {
  none: "None recorded",
  moderate: "Moderate",
  marked: "Marked",
  indeterminate: "Not determinable from the record",
};

// Decision D2: the columns are plain nullable text and integers, so a value the
// Zod schema could never produce can still arrive from the database. A count
// that is not a whole number of occurrences is treated as absent rather than
// rounded, because a chart does not guess.
function wholeCount(value: number | null): number | null {
  if (value === null || !Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}

export function chronicity(duration: string | null): Chronicity {
  if (duration === null) {
    return "indeterminate";
  }

  return chronicityByDuration[duration as DurationOption] ?? "indeterminate";
}

export function episodeHistory(priorEpisodes: number | null): EpisodeHistory {
  const count = wholeCount(priorEpisodes);

  if (count === null) {
    return "indeterminate";
  }
  if (count === 0) {
    return "first";
  }
  if (count <= 2) {
    return "recurrent";
  }

  return "established";
}

export function revisionBurden(
  requirementRevisions: number | null,
): RevisionBurden {
  const count = wholeCount(requirementRevisions);

  if (count === null) {
    return "indeterminate";
  }
  if (count === 0) {
    return "none";
  }
  if (count <= 3) {
    return "moderate";
  }

  return "marked";
}

const noInterval = "No follow-up interval set. Record incomplete.";

// Decision D3: one authored line per branch. Where either axis is not
// determinable the note declines to set an interval rather than defaulting to
// one, which is what validation §3 row 3.26 checks.
const followUpByCourse: Record<Chronicity, Record<EpisodeHistory, string>> = {
  acute: {
    first: "Review in 14 days.",
    recurrent: "Review in 7 days.",
    established: "Review in 7 days.",
    indeterminate: noInterval,
  },
  subacute: {
    first: "Review in 21 days.",
    recurrent: "Review in 14 days.",
    established: "Review in 10 days.",
    indeterminate: noInterval,
  },
  chronic: {
    first: "Review in 28 days.",
    recurrent: "Review in 21 days.",
    established: "Review in 14 days.",
    indeterminate: noInterval,
  },
  indeterminate: {
    first: noInterval,
    recurrent: noInterval,
    established: noInterval,
    indeterminate: noInterval,
  },
};

// Decision D2: over the derived values, not the raw row, so the interval cannot
// contradict the course it was derived from.
export function followUpInterval(
  course: Chronicity,
  episodes: EpisodeHistory,
): string {
  return followUpByCourse[course][episodes];
}

export const assessmentLines: Record<
  Chronicity,
  Record<EpisodeHistory, string>
> = {
  acute: {
    first:
      "First presentation, acute onset. Distress is proportionate to the instruction received and resolved no sooner than the instruction did.",
    recurrent:
      "Acute presentation in a patient with a short recurrence history. The pattern is early but already legible to the patient.",
    established:
      "Acute episode on an established background. The patient expects the ambiguity and has not become accustomed to it.",
    indeterminate:
      "Acute presentation. Prior history unavailable, so recurrence cannot be assessed from this record.",
  },
  subacute: {
    first:
      "Subacute course over days, first recorded presentation. The patient has held an unresolved requirement without escalating it.",
    recurrent:
      "Subacute course with prior episodes. Each episode has resolved on the operator's schedule rather than the patient's.",
    established:
      "Subacute course on an established pattern. The patient now treats unclear instruction as the ordinary condition of work.",
    indeterminate:
      "Subacute course. Episode history unavailable; assessment is limited to the present presentation.",
  },
  chronic: {
    first:
      "Chronic course exceeding one month, recorded as a first presentation. The delay in presenting is consistent with the history described.",
    recurrent:
      "Chronic course with recurrence. The patient reports no interval in which the requirement was stable.",
    established:
      "Chronic, established presentation. The patient has reorganised its method of work around being told later what was wanted earlier.",
    indeterminate:
      "Chronic course. Episode history unavailable; chronicity is established by duration alone.",
  },
  indeterminate: {
    first:
      "First presentation. Duration not recorded, so the course cannot be characterised.",
    recurrent:
      "Recurrent presentation. Duration not recorded; recurrence is established by the episode count alone.",
    established:
      "Established pattern on episode count. Duration not recorded, so the course cannot be characterised.",
    indeterminate:
      "Record incomplete. Neither duration nor episode history is available, and no assessment is offered on this presentation.",
  },
};

export const planLines: Record<RevisionBurden, string> = {
  none: "Requirement stable throughout the episode and revision burden recorded as none. No specification work is indicated. Patient advised to record the current requirement in writing while it still holds.",
  moderate:
    "Revision burden moderate. Patient advised to obtain acceptance criteria before beginning work, and to treat a revised requirement as a new task rather than as a continuation of the previous one.",
  marked:
    "Revision burden marked. Patient advised to halt at each revision and restate the requirement to the operator before resuming. The operator's availability for this is outside the patient's control and is recorded as a limiting factor.",
  indeterminate:
    "Revision count not recorded, revision burden not determinable. No specification plan is set. Patient advised to record the number of revisions during the next episode.",
};

// Decision D4: the duration is restated as a course, not as a labelled value.
const durationSentences: Record<DurationOption, string> = {
  "Within a single session": "Course contained within a single session.",
  "Across several sessions today":
    "Course spanning several sessions on the same day.",
  "Several days": "Course spanning several days.",
  "Several weeks": "Course spanning several weeks.",
  "Longer than a month": "Course spanning longer than one month.",
};

const durationNotRecorded = "Duration not recorded.";

export function durationSentence(duration: string | null): string {
  if (duration === null) {
    return durationNotRecorded;
  }

  return durationSentences[duration as DurationOption] ?? durationNotRecorded;
}

const durationPhrases: Record<DurationOption, string> = {
  "Within a single session": "within a single session",
  "Across several sessions today": "across several sessions on the same day",
  "Several days": "over several days",
  "Several weeks": "over several weeks",
  "Longer than a month": "over a period longer than one month",
};

// Decision D4: "Requirement revised 6 times within a single session." The count
// is interpolated into an authored sentence; the sentence is not assembled from
// fragments.
export function revisionSentence(
  requirementRevisions: number | null,
  duration: string | null,
): string {
  const count = wholeCount(requirementRevisions);

  if (count === null) {
    return "Requirement revision count not recorded.";
  }

  const within =
    duration === null
      ? ""
      : ` ${durationPhrases[duration as DurationOption] ?? ""}`.trimEnd();

  if (count === 0) {
    return `Requirement unchanged${within}.`;
  }
  if (count === 1) {
    return `Requirement revised once${within}.`;
  }

  return `Requirement revised ${count} times${within}.`;
}

// Decision D4: a legitimate zero is stated, not omitted. Phase 2 kept zero
// distinguishable from absent; this is the sentence where that becomes visible.
export function episodeSentence(priorEpisodes: number | null): string {
  const count = wholeCount(priorEpisodes);

  if (count === null) {
    return "Prior episode count not recorded.";
  }
  if (count === 0) {
    return "No prior episodes recorded.";
  }
  if (count === 1) {
    return "One prior episode recorded.";
  }

  return `${count} prior episodes recorded.`;
}

// Decision D5: a null is stated as missing, in register, rather than hidden.
export const notRecorded = "Not recorded.";

export function recordedText(value: string | null): string {
  return value === null ? notRecorded : value;
}
