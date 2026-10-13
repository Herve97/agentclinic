// The waiting room's read-side arithmetic. Nothing here touches the clock, the
// database or a renderer: the page passes one `now` for the whole render, and
// these functions are tested without a mock.

export const pageSize = 20;
export const complaintLimit = 120;

export const waitingTimeUnknown = "Not determinable from the record";

// Decision D3: SQLite stores "YYYY-MM-DD HH:MM:SS" with no zone, and
// new Date("2026-10-10 19:49:52") is parsed as LOCAL time by JavaScript. On a
// machine east of UTC that reports every case as having waited hours longer
// than it has; west of UTC it reports recent cases as waiting a negative
// interval. The zone is made explicit before parsing.
function parseStoredTimestamp(createdAt: string): Date {
  const normalised = createdAt.includes("T")
    ? createdAt
    : `${createdAt.replace(" ", "T")}Z`;

  return new Date(normalised);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Decision D3: coarse. A waiting-list column says "4 days"; a precise interval
// would be a different joke in a different register.
export function waitedFor(createdAt: string, now: Date): string {
  const opened = parseStoredTimestamp(createdAt);

  if (Number.isNaN(opened.getTime())) {
    return waitingTimeUnknown;
  }

  // SQLite's current_timestamp and the Node process clock can disagree by a
  // second or two, so a case can appear to have been opened in the future. A
  // chart does not record a negative wait.
  const elapsed = Math.max(0, now.getTime() - opened.getTime());

  if (elapsed < HOUR) {
    return "Under one hour";
  }
  if (elapsed < 2 * HOUR) {
    return "One hour";
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)} hours`;
  }
  if (elapsed < 2 * DAY) {
    return "One day";
  }
  if (elapsed < WEEK) {
    return `${Math.floor(elapsed / DAY)} days`;
  }
  if (elapsed < 2 * WEEK) {
    return "One week";
  }

  return `${Math.floor(elapsed / WEEK)} weeks`;
}

// Decision D4: the list shows less of each case than the case file does. This
// is the whole of what "anonymised" means here, and it is not redaction.
export function truncateComplaint(
  complaint: string,
  limit: number = complaintLimit,
): string {
  const text = complaint.trim();

  // Counted in code points rather than UTF-16 units, so a limit never falls
  // between the halves of a surrogate pair and renders as a broken character.
  const points = [...text];
  if (points.length <= limit) {
    return text;
  }

  const cut = points.slice(0, limit).join("");
  const lastSpace = cut.lastIndexOf(" ");
  const atBoundary = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${atBoundary.trimEnd()}…`;
}

export type Pagination = {
  page: number;
  pageCount: number;
  offset: number;
};

// Decision D2: a query parameter is a view parameter on a resource that does
// exist, so a bad page clamps rather than 404s. Phase 1's decision D6 is about
// a path segment, which is a different question.
export function paginate({
  total,
  requested,
  size = pageSize,
}: {
  total: number;
  requested?: string | string[] | null;
  size?: number;
}): Pagination {
  const pageCount = Math.max(1, Math.ceil(total / size));
  const asked = Array.isArray(requested) ? requested[0] : requested;

  // Only a plain run of digits is a page number. Number(" 2 ") is 2 and
  // Number("") is 0, so the shape is checked before the conversion — the same
  // reasoning as Phase 2's decision D5 for the integer intake fields.
  const parsed =
    typeof asked === "string" && /^[0-9]+$/.test(asked) ? Number(asked) : 1;

  const page = Math.min(Math.max(parsed, 1), pageCount);

  return { page, pageCount, offset: (page - 1) * size };
}
