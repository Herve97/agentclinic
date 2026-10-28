import { z } from "zod";

import { clinicalDate, frontmatterError, requiredText } from "./frontmatter";
import { isSlugShape } from "./slug";

// Phase 7, decision D8. The frontmatter of a transcript is a schema, for the
// reason Phase 6's chart frontmatter is one: adding a file publishes content,
// so a typo that publishes a session with no clinician would make that
// property a liability rather than a feature.
//
// Nothing in this module reads the clock, the filesystem or the database. In
// particular it does NOT check that a cast member exists — decision D4. A
// patient slug is a filename in a directory, which only the filesystem knows,
// so this module checks the shape and src/content/transcripts.ts resolves the
// reference. That split is the one structural difference between the two
// collections, and it exists because the thing being referred to lives
// somewhere else.

// Decision D4: a cast entry is a slug as it appears in a URL. "mallow-1.mdx"
// is refused, because a cast citing filenames would be citing the storage
// rather than the patient.
const castSlug = z
  .string({ error: "A cast entry is required." })
  .trim()
  .refine(isSlugShape, {
    error: (issue) =>
      `${String(issue.input)} is not a patient slug: lowercase letters, digits and single hyphens, with no extension.`,
  });

// Decision D8, and the reason this is strict rather than permissive: an
// unrecognised key in frontmatter is almost always a misspelling of a
// recognised one — `clinicians` for `clinician` — and a misspelling that
// publishes is the failure this schema exists to prevent.
export const transcriptFrontmatterSchema = z.strictObject({
  title: requiredText("A session title is required."),
  date: clinicalDate("The session date"),
  clinician: requiredText(
    "The clinician facilitating the session is required.",
  ),
  setting: requiredText(
    "The setting in which the session was held is required.",
  ),
  cast: z
    .array(castSlug)
    .min(1, "A session records at least one patient present.")
    // A patient listed twice is an authoring error, not a patient who attended
    // twice. Caught here rather than in the reader because it is a property of
    // the list alone and needs no filesystem to see.
    .superRefine((cast, ctx) => {
      const duplicate = cast.find((slug, at) => cast.indexOf(slug) !== at);

      if (duplicate !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: `${duplicate} is listed twice in the cast. A patient is present or absent, not present twice.`,
        });
      }
    }),
  summary: requiredText("A one-line summary is required."),
});

export type TranscriptFrontmatter = z.infer<typeof transcriptFrontmatterSchema>;

export type TranscriptRecord = {
  slug: string;
  frontmatter: TranscriptFrontmatter;
};

export function parseTranscriptFrontmatter(
  filename: string,
  data: unknown,
): TranscriptFrontmatter {
  const result = transcriptFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw frontmatterError(filename, result.error);
  }

  return result.data;
}

// Decision D7, and the one ordering choice in this phase that looks like a
// contradiction of the last one: the session list is newest first, where the
// patient register is by clinic number ascending.
//
// They differ because they answer different questions. A register is a roster
// and is read from the top; a clinic number never changes, so the order never
// moves. A list of sessions is a record of events, and the question a reader
// brings to it is what happened most recently.
//
// Ties break by slug so that the order is total. Two sessions on one date must
// not depend on the order the filesystem happened to hand them over, or a
// prerendered page would differ between builds for no reason a reader could
// see.
export function transcriptOrder(
  transcripts: TranscriptRecord[],
): TranscriptRecord[] {
  return [...transcripts].sort((a, b) => {
    const byDate = b.frontmatter.date.localeCompare(a.frontmatter.date);

    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
  });
}
