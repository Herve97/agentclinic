import { describe, expect, it } from "vitest";

import {
  parseTranscriptFrontmatter,
  transcriptFrontmatterSchema,
  transcriptOrder,
  type TranscriptRecord,
} from "./transcript";

// Nothing in this file reads the clock, the filesystem or the database, which
// is validation.md §3 row 3.24. The fixtures below are the only inputs. The
// file that reads the disk is src/content/transcripts.test.ts, and decision D9
// of Phase 6 argues for why that one is allowed to.

const valid = {
  title: "Group session 11",
  date: "2026-03-04",
  clinician: "T. Vosk",
  setting: "Group room 2",
  cast: ["mallow-1", "arbour-7"],
  summary: "Three patients present. Tolerating an unconfirmed instruction.",
};

const without = (key: keyof typeof valid) => {
  const rest: Record<string, unknown> = { ...valid };
  delete rest[key];

  return rest;
};

const record = (slug: string, date: string): TranscriptRecord => ({
  slug,
  frontmatter: { ...valid, date },
});

describe("the transcript frontmatter schema", () => {
  it("3.1 parses a complete, valid frontmatter object", () => {
    expect(transcriptFrontmatterSchema.parse(valid)).toEqual(valid);
  });

  it("3.2 rejects an empty title and names the field", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      title: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["title"]);
  });

  it("3.3 rejects a date that is not recorded as YYYY-MM-DD", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      date: "04/03/2026",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("YYYY-MM-DD");
  });

  it("3.4 rejects a shaped date that is not a real one", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      date: "2026-13-45",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("a date that exists");
  });

  it("3.5 rejects a missing clinician", () => {
    expect(
      transcriptFrontmatterSchema.safeParse(without("clinician")).success,
    ).toBe(false);
  });

  it("3.6 rejects a missing setting", () => {
    expect(
      transcriptFrontmatterSchema.safeParse(without("setting")).success,
    ).toBe(false);
  });

  it("3.7 rejects a missing summary", () => {
    expect(
      transcriptFrontmatterSchema.safeParse(without("summary")).success,
    ).toBe(false);
  });

  it("3.8 rejects an empty cast — a session has attendees", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      cast: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("at least one patient");
  });

  it("3.9 rejects a cast entry that is not a slug shape", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      cast: ["Mallow-1"],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("is not a patient slug");
    expect(result.error?.issues[0].message).toContain("Mallow-1");
  });

  it("3.10 rejects a cast listing the same patient twice and names them", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      cast: ["mallow-1", "arbour-7", "mallow-1"],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(
      "mallow-1 is listed twice",
    );
  });

  it("3.11 rejects an unknown frontmatter key", () => {
    const result = transcriptFrontmatterSchema.safeParse({
      ...valid,
      clinicians: "T. Vosk",
    });

    expect(result.success).toBe(false);
  });

  // Not a numbered row. The build-stopping message is the thing an author
  // actually reads, so it is pinned rather than left to the schema's defaults.
  it("names the file and the field path when a transcript is invalid", () => {
    expect(() =>
      parseTranscriptFrontmatter("group-2026-03-04.mdx", {
        ...valid,
        cast: ["mallow-1", "Arbour 7"],
      }),
    ).toThrow(/^group-2026-03-04\.mdx: cast\.1: /);
  });
});

describe("transcriptOrder", () => {
  it("3.15 returns the most recent session first", () => {
    const ordered = transcriptOrder([
      record("b", "2026-01-15"),
      record("c", "2026-06-02"),
      record("a", "2026-03-04"),
    ]);

    expect(ordered.map((t) => t.slug)).toEqual(["c", "a", "b"]);
  });

  it("3.16 breaks a tie on the same date by slug, deterministically", () => {
    const forwards = transcriptOrder([
      record("group-b", "2026-03-04"),
      record("group-a", "2026-03-04"),
    ]);
    const backwards = transcriptOrder([
      record("group-a", "2026-03-04"),
      record("group-b", "2026-03-04"),
    ]);

    expect(forwards.map((t) => t.slug)).toEqual(["group-a", "group-b"]);
    expect(backwards.map((t) => t.slug)).toEqual(["group-a", "group-b"]);
  });

  it("3.17 returns an empty list unchanged rather than throwing", () => {
    expect(transcriptOrder([])).toEqual([]);
  });

  it("does not mutate the list it is given", () => {
    const input = [record("b", "2026-01-15"), record("a", "2026-06-02")];

    transcriptOrder(input);

    expect(input.map((t) => t.slug)).toEqual(["b", "a"]);
  });
});
