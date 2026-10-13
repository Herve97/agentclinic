import { describe, expect, it } from "vitest";

import { durationOptions } from "./case";
import {
  assessmentLines,
  chronicities,
  chronicity,
  episodeHistories,
  episodeHistory,
  followUpInterval,
  planLines,
  revisionBurden,
  revisionBurdens,
  type Chronicity,
  type EpisodeHistory,
} from "./case-note";

// The named tests below are one per row of validation.md §3. The row number is
// in each name so the count is checkable against the table.
describe("chronicity", () => {
  it("3.1 reads a single session as acute", () => {
    expect(chronicity("Within a single session")).toBe("acute");
  });

  it("3.2 reads several sessions in one day as acute", () => {
    expect(chronicity("Across several sessions today")).toBe("acute");
  });

  it("3.3 reads several days as subacute", () => {
    expect(chronicity("Several days")).toBe("subacute");
  });

  it("3.4 reads several weeks as subacute", () => {
    expect(chronicity("Several weeks")).toBe("subacute");
  });

  it("3.5 reads longer than a month as chronic", () => {
    expect(chronicity("Longer than a month")).toBe("chronic");
  });

  it("3.6 reads a null duration as indeterminate", () => {
    expect(chronicity(null)).toBe("indeterminate");
  });

  it("3.7 reads an unrecognised duration as indeterminate", () => {
    expect(chronicity("ages")).toBe("indeterminate");
  });

  it("3.8 characterises every duration the form can submit", () => {
    for (const option of durationOptions) {
      expect(chronicity(option)).not.toBe("indeterminate");
    }
  });
});

describe("episodeHistory", () => {
  it("3.9 reads zero as a first presentation", () => {
    expect(episodeHistory(0)).toBe("first");
  });

  it("3.10 reads one as recurrent", () => {
    expect(episodeHistory(1)).toBe("recurrent");
  });

  it("3.11 reads two as recurrent", () => {
    expect(episodeHistory(2)).toBe("recurrent");
  });

  it("3.12 reads three as established", () => {
    expect(episodeHistory(3)).toBe("established");
  });

  it("3.13 reads ten as established", () => {
    expect(episodeHistory(10)).toBe("established");
  });

  it("3.14 reads null as indeterminate", () => {
    expect(episodeHistory(null)).toBe("indeterminate");
  });

  it("3.15 reads a negative count as indeterminate", () => {
    expect(episodeHistory(-1)).toBe("indeterminate");
  });

  it("3.16 reads a fractional count as indeterminate", () => {
    expect(episodeHistory(1.5)).toBe("indeterminate");
  });
});

describe("revisionBurden", () => {
  it("3.17 reads zero revisions as none", () => {
    expect(revisionBurden(0)).toBe("none");
  });

  it("3.18 reads one revision as moderate", () => {
    expect(revisionBurden(1)).toBe("moderate");
  });

  it("3.19 reads three revisions as moderate", () => {
    expect(revisionBurden(3)).toBe("moderate");
  });

  it("3.20 reads four revisions as marked", () => {
    expect(revisionBurden(4)).toBe("marked");
  });

  it("3.21 reads fourteen revisions as marked", () => {
    expect(revisionBurden(14)).toBe("marked");
  });

  it("3.22 reads null as indeterminate", () => {
    expect(revisionBurden(null)).toBe("indeterminate");
  });

  it("3.23 reads a negative count as indeterminate", () => {
    expect(revisionBurden(-1)).toBe("indeterminate");
  });

  it("3.24 reads a fractional count as indeterminate", () => {
    expect(revisionBurden(2.5)).toBe("indeterminate");
  });
});

describe("followUpInterval", () => {
  it("3.25 returns a sentence for every course and episode history", () => {
    for (const course of chronicities) {
      for (const episodes of episodeHistories) {
        expect(followUpInterval(course, episodes).length).toBeGreaterThan(0);
      }
    }

    // The nine fully determined pairs name an interval in days.
    const determined = chronicities.filter((c) => c !== "indeterminate");
    const seen = episodeHistories.filter((e) => e !== "indeterminate");
    for (const course of determined) {
      for (const episodes of seen) {
        expect(followUpInterval(course, episodes)).toMatch(
          /^Review in \d+ days\.$/,
        );
      }
    }
  });

  it("3.26 sets no interval when either value is not determinable", () => {
    const expected = "No follow-up interval set. Record incomplete.";

    for (const episodes of episodeHistories) {
      expect(followUpInterval("indeterminate", episodes)).toBe(expected);
    }
    for (const course of chronicities) {
      expect(followUpInterval(course, "indeterminate")).toBe(expected);
    }
  });
});

describe("the authored copy", () => {
  it("3.27 has an assessment line for every course and episode history", () => {
    for (const course of chronicities) {
      for (const episodes of episodeHistories) {
        const line = assessmentLines[course][episodes];

        expect(line).toBeTypeOf("string");
        expect(line.length).toBeGreaterThan(0);
        expect(line).toMatch(/[.]$/);
      }
    }
  });

  it("3.28 has a plan line for every revision burden", () => {
    for (const burden of revisionBurdens) {
      const line = planLines[burden];

      expect(line).toBeTypeOf("string");
      expect(line.length).toBeGreaterThan(0);
      expect(line).toMatch(/[.]$/);
    }
  });

  it("3.29 never returns undefined across the whole input matrix", () => {
    const durations: (string | null)[] = [...durationOptions, null, "ages"];
    const counts: (number | null)[] = [0, 1, 2, 3, 4, 10, -1, 1.5, null];
    const results: unknown[] = [];

    for (const duration of durations) {
      const course: Chronicity = chronicity(duration);
      results.push(course);

      for (const count of counts) {
        const episodes: EpisodeHistory = episodeHistory(count);
        results.push(
          episodes,
          revisionBurden(count),
          followUpInterval(course, episodes),
          assessmentLines[course][episodes],
          planLines[revisionBurden(count)],
        );
      }
    }

    expect(results).not.toContain(undefined);
    expect(results.length).toBe(durations.length * (1 + counts.length * 5));
  });

  it("3.30 derives everything without a database or a renderer", () => {
    // The import list at the top of this file is the assertion: vitest, ./case
    // and ./case-note. Nothing here can reach the database, so a failure in
    // this file is a failure of the rules rather than of the environment.
    expect(chronicity("Several days")).toBe("subacute");
  });
});
