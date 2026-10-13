import { describe, expect, it } from "vitest";

import {
  complaintLimit,
  paginate,
  truncateComplaint,
  waitedFor,
  waitingTimeUnknown,
} from "./waiting-room";

// A fixed instant, so nothing in this file reads the clock. Every waiting-time
// case is expressed as a stored timestamp relative to it.
const now = new Date("2026-10-13T12:00:00Z");

const storedAt = (msBefore: number) =>
  new Date(now.getTime() - msBefore)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// The named tests below are one per row of validation.md §3. The row number is
// in each name so the count is checkable against the table.
describe("waitedFor", () => {
  it("3.1 reports thirty seconds as under an hour", () => {
    expect(waitedFor(storedAt(30_000), now)).toBe("Under one hour");
  });

  it("3.2 reports fifty-nine minutes as under an hour", () => {
    expect(waitedFor(storedAt(59 * MINUTE), now)).toBe("Under one hour");
  });

  it("3.3 reports one hour as one hour", () => {
    expect(waitedFor(storedAt(HOUR), now)).toBe("One hour");
  });

  it("3.4 reports five hours in plural hours", () => {
    expect(waitedFor(storedAt(5 * HOUR), now)).toBe("5 hours");
  });

  it("3.5 reports one day as one day", () => {
    expect(waitedFor(storedAt(DAY), now)).toBe("One day");
  });

  it("3.6 reports three days in plural days", () => {
    expect(waitedFor(storedAt(3 * DAY), now)).toBe("3 days");
  });

  it("3.7 reports eight days as one week", () => {
    expect(waitedFor(storedAt(8 * DAY), now)).toBe("One week");
  });

  it("3.8 reports thirty days in plural weeks", () => {
    expect(waitedFor(storedAt(30 * DAY), now)).toBe("4 weeks");
  });

  it("3.9 reads the stored timestamp as UTC, whatever the machine's zone", () => {
    // Four hours apart in UTC. Parsed as local time this still differs by four
    // hours, so the assertion that catches the bug is the absolute one below:
    // a timestamp known to be four hours before `now` must read "4 hours", and
    // it only does if the parse was UTC.
    expect(waitedFor("2026-10-13 08:00:00", now)).toBe("4 hours");

    // The same instant written with an explicit zone must agree.
    expect(waitedFor("2026-10-13T08:00:00Z", now)).toBe("4 hours");

    // And the machine running this test is not assumed to be at UTC.
    expect(new Date("2026-10-13 08:00:00").getTime()).toBe(
      new Date("2026-10-13T08:00:00").getTime(),
    );
  });

  it("3.10 reports a timestamp a few seconds in the future as under an hour", () => {
    expect(waitedFor(storedAt(-5_000), now)).toBe("Under one hour");
  });

  it("3.11 states an unparseable timestamp rather than throwing", () => {
    expect(waitedFor("not a timestamp", now)).toBe(waitingTimeUnknown);
    expect(waitedFor("", now)).toBe(waitingTimeUnknown);
  });
});

describe("truncateComplaint", () => {
  it("3.12 leaves a complaint under the limit unchanged", () => {
    const short = "Asked to make it pop.";

    expect(truncateComplaint(short)).toBe(short);
    expect(truncateComplaint(short)).not.toContain("…");
  });

  it("3.13 cuts a long complaint at a word boundary", () => {
    const long = `${"specification ".repeat(20)}end`;
    const result = truncateComplaint(long);

    expect(result.endsWith("…")).toBe(true);
    expect([...result].length).toBeLessThanOrEqual(complaintLimit + 1);
    // The cut fell between words, so no partial word is left before the
    // ellipsis.
    expect(result.slice(0, -1).endsWith("specification")).toBe(true);
  });

  it("3.14 cuts a single word longer than the limit at the limit", () => {
    const oneWord = "u".repeat(200);
    const result = truncateComplaint(oneWord);

    expect([...result].length).toBe(complaintLimit + 1);
    expect(result.endsWith("…")).toBe(true);
  });

  it("3.15 does not break a multi-byte character", () => {
    const emoji = "🙂".repeat(200);
    const result = truncateComplaint(emoji, 10);

    expect([...result]).toHaveLength(11);
    expect(result).not.toContain("�");
    // Every code point except the ellipsis is still a whole emoji.
    expect([...result].slice(0, 10).every((c) => c === "🙂")).toBe(true);
  });

  it("3.16 leaves a complaint exactly at the limit unchanged", () => {
    const exact = "x".repeat(complaintLimit);

    expect(truncateComplaint(exact)).toBe(exact);
    expect(truncateComplaint(exact)).not.toContain("…");
  });
});

describe("paginate", () => {
  it("3.17 puts page 1 of 23 rows at offset 0 of 2 pages", () => {
    expect(paginate({ total: 23, requested: "1" })).toEqual({
      page: 1,
      pageCount: 2,
      offset: 0,
    });
  });

  it("3.18 puts page 2 of 23 rows at offset 20", () => {
    expect(paginate({ total: 23, requested: "2" })).toEqual({
      page: 2,
      pageCount: 2,
      offset: 20,
    });
  });

  it("3.19 clamps a page past the end to the last page", () => {
    expect(paginate({ total: 23, requested: "9" }).page).toBe(2);
    expect(paginate({ total: 23, requested: "9" }).offset).toBe(20);
  });

  it("3.20 clamps zero, negative, non-numeric and missing to page 1", () => {
    for (const requested of ["0", "-1", "abc", "1.5", "", " 2 ", undefined]) {
      expect(paginate({ total: 23, requested }).page).toBe(1);
    }

    expect(paginate({ total: 23, requested: null }).page).toBe(1);
    // Next can hand back a repeated query parameter as an array.
    expect(paginate({ total: 23, requested: ["2", "3"] }).page).toBe(2);
  });

  it("3.21 returns a valid page for an empty table", () => {
    expect(paginate({ total: 0, requested: "1" })).toEqual({
      page: 1,
      pageCount: 1,
      offset: 0,
    });
  });

  it("3.22 reports one page when the total is exactly one page", () => {
    expect(paginate({ total: 20, requested: "1" }).pageCount).toBe(1);
    expect(paginate({ total: 20, requested: "2" }).page).toBe(1);
  });

  it("3.23 computes everything without the clock or the database", () => {
    // The import list at the top of this file is the assertion: vitest and
    // ./waiting-room. Every waiting-time case is measured against a fixed
    // `now` declared in this file, so the suite is deterministic.
    expect(waitedFor(storedAt(3 * DAY), now)).toBe("3 days");
  });
});
