import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

// Phase 7, decision D6. A transcript's turns are authored as elements rather
// than as a prose convention, because a bolded name at the head of a paragraph
// renders and carries no structure: the speaker cannot be linked to their
// chart, and a misspelt name is invisible.
//
// Unlike Phase 6's map in ./mdx-components.tsx, this one cannot be a constant.
// <Turn speaker="mallow-1"> has to render that patient's designation and link
// to their chart, so the map is built per transcript by the reader, which is
// the only module that knows the cast. The reader comments that too, at the
// place it builds it.
//
// Styling is Phase 6's decision D11 unchanged: the same utilities the chart
// and the case note already use. No new colour, no new font, no spacing
// scale, no component class. Phase 10 still owns the design system.

export type CastMember = {
  slug: string;
  name: string;
};

type TranscriptContext = {
  filename: string;
  cast: CastMember[];
  clinician: string;
};

// The reserved speaker. The clinician's name is already in the frontmatter, so
// repeating it on every turn would be a second source of truth for one fact —
// and a transcript whose turns disagreed with its own header about who was
// facilitating would be a worse record than one that could not say.
export const CLINICIAN = "clinician";

export function transcriptComponents({
  filename,
  cast,
  clinician,
}: TranscriptContext): MDXComponents {
  const designations = new Map(cast.map(({ slug, name }) => [slug, name]));

  function Turn({
    speaker,
    at,
    children,
  }: {
    speaker?: string;
    at?: string;
    children?: ReactNode;
  }) {
    // Decision D6, by the same argument as decision D5: a speaker who is
    // neither in the cast nor facilitating is a broken record, and both routes
    // prerender, so this throw stops `next build` rather than reaching a
    // reader.
    if (speaker === undefined) {
      throw new Error(`${filename}: a turn requires a speaker.`);
    }

    if (at === undefined) {
      throw new Error(
        `${filename}: the turn by "${speaker}" requires a timestamp.`,
      );
    }

    const isClinician = speaker === CLINICIAN;
    const name = designations.get(speaker);

    if (!isClinician && name === undefined) {
      throw new Error(
        `${filename}: "${speaker}" speaks but is not in the cast and is not "${CLINICIAN}".`,
      );
    }

    return (
      <div className="mt-4">
        <p className="text-sm">
          {isClinician ? (
            <span>{clinician}</span>
          ) : (
            <Link href={`/patients/${speaker}`}>{name}</Link>
          )}
          <span className="ml-2">{at}</span>
        </p>
        {/* Not a <p>: MDX has already wrapped the turn's text in one, and a
            paragraph inside a paragraph is invalid HTML that the browser
            silently repositions. Caught by validation row 2.11 rather than by
            reading the markup. */}
        <div className="mt-1">{children}</div>
      </div>
    );
  }

  function Annotation({ children }: { children?: ReactNode }) {
    // An aside, not an indented paragraph: a clinician's annotation is a
    // different kind of utterance from a turn and a record that renders them
    // identically is a record that has lost the distinction.
    return (
      <aside className="mt-4 border-l pl-4 text-sm">
        <p className="font-semibold">{"Clinician's note"}</p>
        {children}
      </aside>
    );
  }

  return { Turn, Annotation };
}
