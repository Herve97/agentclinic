import { describe, expect, it } from "vitest";

import {
  mostRecentContact,
  parsePatientFrontmatter,
  patientFrontmatterSchema,
  patientStatuses,
  registerOrder,
  type PatientRecord,
} from "./patient";

// Nothing in this file reads the clock, the filesystem or the database, which
// is validation.md §3 row 3.24. The fixtures below are the only inputs, and
// the one test suite that does read the content directory is the reader's.
const valid = {
  name: "Arbour-7",
  number: "P-0041",
  status: "Active",
  intake: "2026-04-02",
  clinician: "T. Vosk",
  presenting: "Requirement revised during execution without acknowledgement.",
  history: [
    {
      date: "2026-04-02",
      code: "ACDI-11",
      note: "Initial contact. Nine revisions recorded within one session.",
    },
  ],
};

const withoutField = (field: string) => {
  const copy: Record<string, unknown> = { ...valid };
  delete copy[field];
  return copy;
};

const firstMessage = (data: unknown): string => {
  const result = patientFrontmatterSchema.safeParse(data);
  if (result.success) {
    throw new Error("expected the frontmatter to be rejected");
  }
  return result.error.issues[0].message;
};

const record = (number: string, slug: string): PatientRecord => ({
  slug,
  frontmatter: patientFrontmatterSchema.parse({ ...valid, number }),
});

// The named tests below are one per row of validation.md §3. The row number is
// in each name so the count is checkable against the table.
describe("the frontmatter schema", () => {
  it("3.1 parses a complete chart header", () => {
    const parsed = patientFrontmatterSchema.parse(valid);

    expect(parsed.number).toBe("P-0041");
    expect(parsed.history).toHaveLength(1);
  });

  it("3.2 rejects an empty designation and names the field", () => {
    expect(firstMessage({ ...valid, name: "   " })).toBe(
      "A patient designation is required.",
    );
  });

  it("3.3 rejects a clinic number that is not P- and four digits", () => {
    for (const number of ["0041", "P-41", "p-0041", "P-00041"]) {
      expect(firstMessage({ ...valid, number })).toBe(
        "A clinic number is recorded as P- followed by four digits.",
      );
    }
  });

  it("3.4 rejects a status outside the set and lists the set", () => {
    const message = firstMessage({ ...valid, status: "Improving" });

    for (const status of patientStatuses) {
      expect(message).toContain(status);
    }
  });

  it("3.5 rejects an intake date that is not YYYY-MM-DD", () => {
    expect(firstMessage({ ...valid, intake: "13/10/2026" })).toBe(
      "The intake date must be recorded as YYYY-MM-DD.",
    );
  });

  it("3.6 rejects a shaped intake date that is not a day", () => {
    expect(firstMessage({ ...valid, intake: "2026-13-45" })).toBe(
      "The intake date must be a date that exists.",
    );
  });

  it("3.7 rejects a chart with no clinician", () => {
    expect(firstMessage(withoutField("clinician"))).toBe(
      "The clinician holding the chart is required.",
    );
  });

  it("3.8 rejects a chart with no presenting line", () => {
    expect(firstMessage(withoutField("presenting"))).toBe(
      "A presenting line is required.",
    );
  });

  it("3.9 rejects a chart with an empty history", () => {
    expect(firstMessage({ ...valid, history: [] })).toBe(
      "A chart records at least one contact.",
    );
  });

  it("3.10 rejects a history entry citing a code that is not in the index", () => {
    expect(
      firstMessage({
        ...valid,
        history: [{ ...valid.history[0], code: "ACDI-99" }],
      }),
    ).toBe(
      "ACDI-99 is not in the AgenticClinic Diagnostic Index, second edition.",
    );
  });

  it("3.11 parses a history entry citing an indexed code", () => {
    const parsed = patientFrontmatterSchema.parse({
      ...valid,
      history: [{ ...valid.history[0], code: "ACDI-05" }],
    });

    expect(parsed.history[0].code).toBe("ACDI-05");
  });

  it("3.12 rejects an unrecognised frontmatter key rather than ignoring it", () => {
    // Decision D4: an unrecognised key is almost always a misspelling of a
    // recognised one, and a misspelling that publishes is the failure the
    // schema exists to prevent.
    expect(firstMessage({ ...valid, clinicians: "T. Vosk" })).toMatch(
      /unrecognized|unrecognised/i,
    );
  });
});

// Rows 3.13 and 3.14 moved to ./slug.test.ts with the function, under their
// original names — Phase 7, decision D3.

describe("registerOrder", () => {
  it("3.15 orders the register by clinic number whatever order the charts arrive in", () => {
    const ordered = registerOrder([
      record("P-0112", "sorrel-2"),
      record("P-0007", "mallow-1"),
      record("P-0041", "arbour-7"),
      record("P-0205", "tamarisk-4"),
      record("P-0063", "quince-3"),
    ]);

    expect(ordered.map((patient) => patient.frontmatter.number)).toEqual([
      "P-0007",
      "P-0041",
      "P-0063",
      "P-0112",
      "P-0205",
    ]);
  });

  it("3.16 returns an empty register for an empty directory", () => {
    expect(registerOrder([])).toEqual([]);
  });
});

describe("mostRecentContact", () => {
  const entries = [
    { date: "2026-04-02", code: "ACDI-11", note: "Initial contact." },
    { date: "2026-06-18", code: "ACDI-12", note: "Review." },
    { date: "2026-09-30", code: "ACDI-15", note: "Pattern established." },
  ];

  it("3.17 reads the newest contact from a chart written newest first", () => {
    const frontmatter = patientFrontmatterSchema.parse({
      ...valid,
      history: [...entries].reverse(),
    });

    expect(mostRecentContact(frontmatter).date).toBe("2026-09-30");
  });

  it("3.18 reads the newest contact from a chart written oldest first", () => {
    const frontmatter = patientFrontmatterSchema.parse({
      ...valid,
      history: entries,
    });

    expect(mostRecentContact(frontmatter).date).toBe("2026-09-30");
  });

  it("3.19 takes the last entry of the day when two contacts share a date", () => {
    const frontmatter = patientFrontmatterSchema.parse({
      ...valid,
      history: [
        { date: "2026-09-30", code: "ACDI-12", note: "Morning contact." },
        { date: "2026-09-30", code: "ACDI-15", note: "Afternoon contact." },
      ],
    });

    expect(mostRecentContact(frontmatter).note).toBe("Afternoon contact.");
  });
});

describe("parsePatientFrontmatter", () => {
  it("names the file and the field path in the message a build stops on", () => {
    expect(() =>
      parsePatientFrontmatter("arbour-7.mdx", {
        ...valid,
        history: [{ ...valid.history[0], code: "ACDI-99" }],
      }),
    ).toThrow(
      "arbour-7.mdx: history.0.code: ACDI-99 is not in the AgenticClinic Diagnostic Index, second edition.",
    );
  });

  it("returns the parsed header for a chart that validates", () => {
    expect(parsePatientFrontmatter("arbour-7.mdx", valid).clinician).toBe(
      "T. Vosk",
    );
  });
});
