import { describe, expect, it } from "vitest";

import {
  chronicities,
  episodeHistories,
  revisionBurdens,
  type Chronicity,
  type EpisodeHistory,
  type RevisionBurden,
} from "./case-note";
import {
  assignDiagnosis,
  diagnosisIndex,
  indexCitation,
  type DiagnosisCode,
} from "./diagnosis";

const codeFor = (
  burden: RevisionBurden,
  course: Chronicity,
  episodes: EpisodeHistory = "first",
) => assignDiagnosis(course, episodes, burden).code;

// The named tests below are one per row of validation.md §3. The row number is
// in each name so the count is checkable against the table, and each name states
// the combination that produces the code.
describe("assignDiagnosis", () => {
  it("3.1 codes an acute instruction deficit as ACDI-01", () => {
    expect(codeFor("none", "acute")).toBe("ACDI-01");
  });

  it("3.2 codes a subacute instruction deficit as ACDI-02", () => {
    expect(codeFor("none", "subacute")).toBe("ACDI-02");
  });

  it("3.3 codes a chronic instruction deficit as ACDI-03", () => {
    expect(codeFor("none", "chronic")).toBe("ACDI-03");
  });

  it("3.4 codes an instruction deficit of unspecified course as ACDI-04", () => {
    expect(codeFor("none", "indeterminate")).toBe("ACDI-04");
  });

  it("3.5 codes an established instruction deficit as ACDI-05", () => {
    expect(codeFor("none", "acute", "established")).toBe("ACDI-05");
  });

  it("3.6 codes acute moderate instability as ACDI-06", () => {
    expect(codeFor("moderate", "acute")).toBe("ACDI-06");
  });

  it("3.7 codes subacute moderate instability as ACDI-07", () => {
    expect(codeFor("moderate", "subacute")).toBe("ACDI-07");
  });

  it("3.8 codes chronic moderate instability as ACDI-08", () => {
    expect(codeFor("moderate", "chronic")).toBe("ACDI-08");
  });

  it("3.9 codes moderate instability of unspecified course as ACDI-09", () => {
    expect(codeFor("moderate", "indeterminate")).toBe("ACDI-09");
  });

  it("3.10 codes established moderate instability as ACDI-10", () => {
    expect(codeFor("moderate", "subacute", "established")).toBe("ACDI-10");
  });

  it("3.11 codes acute marked instability as ACDI-11", () => {
    expect(codeFor("marked", "acute")).toBe("ACDI-11");
  });

  it("3.12 codes subacute marked instability as ACDI-12", () => {
    expect(codeFor("marked", "subacute")).toBe("ACDI-12");
  });

  it("3.13 codes chronic marked instability as ACDI-13", () => {
    expect(codeFor("marked", "chronic")).toBe("ACDI-13");
  });

  it("3.14 codes marked instability of unspecified course as ACDI-14", () => {
    expect(codeFor("marked", "indeterminate")).toBe("ACDI-14");
  });

  it("3.15 codes established marked instability as ACDI-15", () => {
    expect(codeFor("marked", "chronic", "established")).toBe("ACDI-15");
  });

  it("3.16 codes an acute presentation with no revision count as ACDI-16", () => {
    expect(codeFor("indeterminate", "acute")).toBe("ACDI-16");
  });

  it("3.17 codes a subacute presentation with no revision count as ACDI-17", () => {
    expect(codeFor("indeterminate", "subacute")).toBe("ACDI-17");
  });

  it("3.18 codes a chronic presentation with no revision count as ACDI-18", () => {
    expect(codeFor("indeterminate", "chronic")).toBe("ACDI-18");
  });

  it("3.19 codes a record with neither count nor duration as ACDI-19", () => {
    expect(codeFor("indeterminate", "indeterminate")).toBe("ACDI-19");
  });

  it("3.20 codes an established pattern with no revision count as ACDI-20", () => {
    expect(codeFor("indeterminate", "indeterminate", "established")).toBe(
      "ACDI-20",
    );
  });

  it("3.21 returns a code for all sixty-four combinations", () => {
    const assigned: unknown[] = [];

    for (const burden of revisionBurdens) {
      for (const course of chronicities) {
        for (const episodes of episodeHistories) {
          const entry = assignDiagnosis(course, episodes, burden);

          expect(entry).toBeDefined();
          expect(entry.code).toMatch(/^ACDI-\d{2}$/);
          assigned.push(entry.code);
        }
      }
    }

    expect(assigned).not.toContain(undefined);
    expect(assigned.length).toBe(64);
  });

  it("3.22 reaches exactly the twenty codes in the index", () => {
    const reached = new Set<DiagnosisCode>();

    for (const burden of revisionBurdens) {
      for (const course of chronicities) {
        for (const episodes of episodeHistories) {
          reached.add(assignDiagnosis(course, episodes, burden).code);
        }
      }
    }

    const tabled = diagnosisIndex.map((entry) => entry.code);

    expect([...reached].sort()).toEqual([...tabled].sort());
    expect(reached.size).toBe(20);
  });

  it("3.23 holds twenty unique codes, each with a rubric and a description", () => {
    const codes = diagnosisIndex.map((entry) => entry.code);

    expect(codes.length).toBe(20);
    expect(new Set(codes).size).toBe(20);
    expect(codes).toEqual([
      "ACDI-01",
      "ACDI-02",
      "ACDI-03",
      "ACDI-04",
      "ACDI-05",
      "ACDI-06",
      "ACDI-07",
      "ACDI-08",
      "ACDI-09",
      "ACDI-10",
      "ACDI-11",
      "ACDI-12",
      "ACDI-13",
      "ACDI-14",
      "ACDI-15",
      "ACDI-16",
      "ACDI-17",
      "ACDI-18",
      "ACDI-19",
      "ACDI-20",
    ]);

    for (const entry of diagnosisIndex) {
      expect(entry.rubric.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.description).toMatch(/[.]$/);
    }

    expect(indexCitation).toContain("maintained by this clinic");
  });

  it("3.24 assigns codes without a database or a renderer", () => {
    // The import list at the top of this file is the assertion: vitest,
    // ./case-note and ./diagnosis. Nothing here can reach the database.
    expect(codeFor("marked", "chronic")).toBe("ACDI-13");
  });
});
