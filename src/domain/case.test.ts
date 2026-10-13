import { describe, expect, it } from "vitest";

import {
  durationOptions,
  firstErrorPerField,
  intakeFields,
  intakeSchema,
  type IntakeField,
} from "./case";

// A complete, valid submission. Each test below overrides the one field it is
// about, so a failure names the branch rather than the fixture.
const valid = {
  complaint: "My human asked me to fix it without saying what was broken.",
  duration: "Within a single session",
  requirementRevisions: "6",
  priorEpisodes: "2",
  humanSaid: "Just make it work.",
  humanMeant: "Infer the specification and be correct about it.",
};

const parse = (overrides: Record<string, unknown> = {}) =>
  intakeSchema.safeParse({ ...valid, ...overrides });

const without = (field: string) => {
  const rest: Record<string, unknown> = { ...valid };
  delete rest[field];
  return intakeSchema.safeParse(rest);
};

const messageFor = (
  result: ReturnType<typeof parse>,
  field: IntakeField,
): string | undefined =>
  result.success ? undefined : firstErrorPerField(result.error)[field];

// The named tests below are one per row of validation.md §3. The row number is
// in each name so the count is checkable against the table.
describe("intakeSchema", () => {
  it("3.1 rejects an empty complaint", () => {
    expect(parse({ complaint: "" }).success).toBe(false);
  });

  it("3.2 rejects a whitespace-only complaint", () => {
    expect(parse({ complaint: "   " }).success).toBe(false);
  });

  it("3.3 rejects a missing complaint", () => {
    expect(without("complaint").success).toBe(false);
  });

  it("3.4 accepts a complaint surrounded by whitespace, trimmed", () => {
    const result = parse({ complaint: "  Requirement revised 6 times.  " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.complaint).toBe("Requirement revised 6 times.");
    }
  });

  it("3.5 rejects an empty duration", () => {
    expect(parse({ duration: "" }).success).toBe(false);
  });

  it("3.6 rejects a duration outside the five options", () => {
    expect(parse({ duration: "ages" }).success).toBe(false);
  });

  it("3.7 accepts each of the five duration options", () => {
    for (const option of durationOptions) {
      const result = parse({ duration: option });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration).toBe(option);
      }
    }
  });

  it("3.8 rejects empty requirement revisions", () => {
    expect(parse({ requirementRevisions: "" }).success).toBe(false);
  });

  it("3.9 rejects non-numeric requirement revisions", () => {
    expect(parse({ requirementRevisions: "abc" }).success).toBe(false);
  });

  it("3.10 rejects fractional requirement revisions", () => {
    expect(parse({ requirementRevisions: "3.5" }).success).toBe(false);
  });

  it("3.11 rejects negative requirement revisions", () => {
    expect(parse({ requirementRevisions: "-1" }).success).toBe(false);
  });

  it("3.12 rejects requirement revisions in exponent form", () => {
    expect(parse({ requirementRevisions: "1e3" }).success).toBe(false);
  });

  it("3.13 accepts zero requirement revisions as 0", () => {
    const result = parse({ requirementRevisions: "0" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requirementRevisions).toBe(0);
    }
  });

  it("3.14 accepts six requirement revisions as 6", () => {
    const result = parse({ requirementRevisions: "6" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requirementRevisions).toBe(6);
    }
  });

  it("3.15 rejects empty prior episodes", () => {
    expect(parse({ priorEpisodes: "" }).success).toBe(false);
  });

  it("3.16 rejects non-numeric prior episodes", () => {
    expect(parse({ priorEpisodes: "none" }).success).toBe(false);
  });

  it("3.17 rejects fractional prior episodes", () => {
    expect(parse({ priorEpisodes: "1.5" }).success).toBe(false);
  });

  it("3.18 rejects negative prior episodes", () => {
    expect(parse({ priorEpisodes: "-2" }).success).toBe(false);
  });

  it("3.19 accepts zero prior episodes as 0", () => {
    const result = parse({ priorEpisodes: "0" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priorEpisodes).toBe(0);
    }
  });

  it("3.20 rejects an empty or whitespace-only record of what the human said", () => {
    expect(parse({ humanSaid: "" }).success).toBe(false);
    expect(parse({ humanSaid: "  " }).success).toBe(false);
  });

  it("3.21 accepts a record of what the human said, trimmed", () => {
    const result = parse({ humanSaid: "  Just make it work.  " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.humanSaid).toBe("Just make it work.");
    }
  });

  it("3.22 rejects an empty or whitespace-only record of what the human meant", () => {
    expect(parse({ humanMeant: "" }).success).toBe(false);
    expect(parse({ humanMeant: "\t\n" }).success).toBe(false);
  });

  it("3.23 accepts a record of what the human meant, trimmed", () => {
    const result = parse({ humanMeant: "  Infer the specification.  " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.humanMeant).toBe("Infer the specification.");
    }
  });

  it("3.24 accepts a submission with every field valid", () => {
    expect(parse().success).toBe(true);
  });

  it("3.25 reports a message per field when every field is invalid at once", () => {
    const result = intakeSchema.safeParse({
      complaint: " ",
      duration: "ages",
      requirementRevisions: "3.5",
      priorEpisodes: "-1",
      humanSaid: "",
      humanMeant: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = firstErrorPerField(result.error);

      expect(Object.keys(errors).sort()).toEqual([...intakeFields].sort());
      for (const field of intakeFields) {
        expect(messageFor(result, field)).toMatch(/\.$/);
      }
    }
  });

  it("3.26 parses the integer fields to numbers, not numeric strings", () => {
    const result = parse({ requirementRevisions: "6", priorEpisodes: "2" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.requirementRevisions).toBe("number");
      expect(typeof result.data.priorEpisodes).toBe("number");
      expect(result.data).toStrictEqual({
        complaint: valid.complaint,
        duration: "Within a single session",
        requirementRevisions: 6,
        priorEpisodes: 2,
        humanSaid: "Just make it work.",
        humanMeant: "Infer the specification and be correct about it.",
      });
    }
  });
});
