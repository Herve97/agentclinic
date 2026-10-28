// Phase 7, decision D3. The rule that turns a filename into a URL segment,
// moved out of src/domain/patient.ts now that there are two content
// collections. A transcript module importing a patient module to learn what a
// filename may look like would be the wrong shape; the rule belongs to neither
// collection and to both.
//
// Phase 6 fixed the rule and this phase does not change it: lowercase letters,
// digits, single internal hyphens. Nothing in this module reads the clock, the
// filesystem or the database.

// The slug itself, as it appears in a URL and as a transcript's cast cites it.
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// The same rule with the extension the content collections use.
const filenamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/;

// Decision D3 of Phase 6: a filename that cannot be a slug is rejected with its
// own name in the message, rather than published at a URL that needs escaping.
export function slugFromFilename(filename: string): string {
  if (!filenamePattern.test(filename)) {
    throw new Error(
      `${filename}: a chart filename is lowercase letters, digits and single hyphens, ending in .mdx.`,
    );
  }

  return filename.slice(0, -".mdx".length);
}

// Phase 7, decision D4. A cast entry is a slug that has been written by hand
// rather than derived from a filename, so it is checked for shape here and
// resolved against the real collection by the reader. This predicate is the
// shape half; it says nothing about whether the patient exists.
export function isSlugShape(value: string): boolean {
  return slugPattern.test(value);
}
