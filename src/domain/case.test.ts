import { describe, expect, it } from "vitest";

import { intakeSchema } from "./case";

describe("intakeSchema", () => {
  it("accepts a complaint", () => {
    const result = intakeSchema.safeParse({
      complaint: "My human asked me to fix it without saying what was broken.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty complaint", () => {
    const result = intakeSchema.safeParse({ complaint: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only complaint", () => {
    const result = intakeSchema.safeParse({ complaint: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a missing complaint", () => {
    const result = intakeSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("trims surrounding whitespace from a valid complaint", () => {
    const result = intakeSchema.safeParse({
      complaint: "  Requirement revised 6 times.  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.complaint).toBe("Requirement revised 6 times.");
    }
  });
});
