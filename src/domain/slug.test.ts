import { describe, expect, it } from "vitest";

import { isSlugShape, slugFromFilename } from "./slug";

// Phase 7, decision D3. The two `slugFromFilename` tests below are Phase 6's,
// moved here with the module and keeping their original names — rows 3.13 and
// 3.14 of
// specs/2026-10-27-phase-6-patient-profiles/validation.md still have a passing
// named test, which is how that phase's record stays true after the move.
//
// Rows 7.3.12 to 7.3.14 of this phase's validation are the same two plus
// isSlugShape. Nothing in this file reads the clock, the filesystem or the
// database.

describe("slugFromFilename", () => {
  it("3.13 takes the slug from the filename", () => {
    expect(slugFromFilename("arbour-7.mdx")).toBe("arbour-7");
  });

  it("3.14 rejects a filename that cannot be a slug and names it", () => {
    for (const filename of [
      "Arbour 7.mdx",
      "arbour_7.mdx",
      "arbour-7.md",
      "-arbour.mdx",
      "arbour--7.mdx",
    ]) {
      expect(() => slugFromFilename(filename)).toThrow(filename);
    }
  });

  it("7.3.12 takes the slug from a transcript filename", () => {
    expect(slugFromFilename("group-2026-03-04.mdx")).toBe("group-2026-03-04");
  });

  it("7.3.13 rejects a transcript filename that cannot be a slug", () => {
    for (const filename of ["Group 2026.mdx", "group_1.mdx", "g.md"]) {
      expect(() => slugFromFilename(filename)).toThrow(filename);
    }
  });
});

describe("isSlugShape", () => {
  // The decision this row records: a cast entry is the slug as it appears in a
  // URL, with no extension. "mallow-1.mdx" is a filename and is refused here,
  // because a cast that cited filenames would be citing the storage and not
  // the patient.
  it("7.3.14 accepts a slug and refuses anything that is not one", () => {
    expect(isSlugShape("mallow-1")).toBe(true);
    expect(isSlugShape("group-2026-03-04")).toBe(true);

    for (const value of [
      "Mallow-1",
      "mallow_1",
      "mallow 1",
      "mallow-1.mdx",
      "-mallow",
      "mallow-",
      "mallow--1",
      "",
    ]) {
      expect(isSlugShape(value)).toBe(false);
    }
  });
});
