import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import remarkGfm from "remark-gfm";

import {
  parseTranscriptFrontmatter,
  transcriptOrder,
  type TranscriptFrontmatter,
} from "@/domain/transcript";
import { slugFromFilename } from "@/domain/slug";

import { listPatients } from "./patients";
import { mdxComponents } from "./mdx-components";
import {
  CLINICIAN,
  transcriptComponents,
  type CastMember,
} from "./transcript-components";

// Phase 7, decisions D4 and D5. **This is the second impure module in the
// repository**, and like src/content/patients.ts it says so at the top.
// Everything it hands back has been through the Zod schema in
// src/domain/transcript.ts, which is pure and tested on its own.
//
// It is also the only module that resolves one collection against another. The
// schema can check that a cast entry is shaped like a slug; only the
// filesystem knows whether a patient of that slug exists, so the resolution
// happens here and nowhere else.
//
// Every function takes both directories as parameters, defaulting to the real
// ones, so the tests can point them at temporary directories rather than at
// the clinic's own records.

export const transcriptsDirectory = path.join(
  process.cwd(),
  "src",
  "content",
  "transcripts",
);

export type TranscriptRecordWithCast = {
  slug: string;
  frontmatter: TranscriptFrontmatter;
  cast: CastMember[];
};

export type Transcript = TranscriptRecordWithCast & {
  body: ReactElement;
};

// A directory that does not exist is an empty list, not a crash. Git does not
// track empty directories, so a repository whose transcripts were all removed
// would arrive without this folder at all, and plan step 5.8 is explicit that
// there is no state of the repository where this page should look broken.
async function transcriptFilenames(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

// The patient collection, as a lookup from slug to designation. Read once per
// call rather than once per transcript: three transcripts naming five patients
// should not read five charts three times.
async function patientDesignations(
  patientsDir: string | undefined,
): Promise<Map<string, string>> {
  const patients = await listPatients(patientsDir);

  return new Map(
    patients.map(({ slug, frontmatter }) => [slug, frontmatter.name]),
  );
}

// Decision D5: a transcript naming a patient who does not exist is a broken
// record, and the build stops with the file, the field path and the slug. Not
// a 404, not a plain-text name, not a silently dropped link — the failure
// lands at build time on the person who wrote the file, who is the only person
// able to fix it.
function resolveCast(
  filename: string,
  frontmatter: TranscriptFrontmatter,
  designations: Map<string, string>,
): CastMember[] {
  return frontmatter.cast.map((slug, at) => {
    const name = designations.get(slug);

    if (name === undefined) {
      throw new Error(
        `${filename}: cast.${at}: no patient chart exists for "${slug}".`,
      );
    }

    return { slug, name };
  });
}

// Decision D6's build-time half, and the reason it is a scan of the source
// rather than a trust in the component.
//
// <Turn> throws when its speaker is neither in the cast nor facilitating, and
// because both routes prerender, that throw does stop `next build`. But it
// only fires when React renders the element, which is too late for the reader
// to say anything useful and too late for a unit test to see it at all. So
// the speakers are read out of the source before compilation starts, and the
// failure arrives from the same place, in the same shape, as the cast failure
// beside it. The component keeps its throw as the last line of defence.
const speakerAttribute = /<Turn\b[^>]*?\bspeaker="([^"]*)"/g;
const turnTag = /<Turn\b/g;

function validateSpeakers(
  filename: string,
  source: string,
  cast: CastMember[],
  clinician: string,
): void {
  const speakers = [...source.matchAll(speakerAttribute)].map(
    ([, speaker]) => speaker,
  );
  const turns = source.match(turnTag)?.length ?? 0;

  if (speakers.length !== turns) {
    throw new Error(
      `${filename}: a turn requires a speaker, written as speaker="…".`,
    );
  }

  const known = new Set([...cast.map(({ slug }) => slug), CLINICIAN]);

  for (const speaker of speakers) {
    if (!known.has(speaker)) {
      throw new Error(
        `${filename}: "${speaker}" speaks but is not in the cast and is not "${CLINICIAN}". Facilitator is ${clinician}.`,
      );
    }
  }
}

async function readFrontmatter(directory: string, filename: string) {
  const source = await readFile(path.join(directory, filename), "utf8");

  // Frontmatter only. compileMDX is the one parser in the project, so it is
  // used here too rather than adding a second one that could disagree with it.
  const { frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
    components: mdxComponents,
  });

  return parseTranscriptFrontmatter(filename, frontmatter);
}

export async function listTranscripts(
  directory: string = transcriptsDirectory,
  patientsDir?: string,
): Promise<TranscriptRecordWithCast[]> {
  const filenames = await transcriptFilenames(directory);

  if (filenames.length === 0) {
    return [];
  }

  const designations = await patientDesignations(patientsDir);
  const records: TranscriptRecordWithCast[] = [];

  for (const filename of filenames) {
    const slug = slugFromFilename(filename);
    const frontmatter = await readFrontmatter(directory, filename);

    records.push({
      slug,
      frontmatter,
      cast: resolveCast(filename, frontmatter, designations),
    });
  }

  // transcriptOrder sorts the records it is given and carries them through, so
  // the resolved cast rides along with each one.
  return transcriptOrder(records) as TranscriptRecordWithCast[];
}

// Decision D8 of Phase 6, applied here: a slug that resolves to no file is
// absent, not an error. The route turns that into a 404; nothing here decides
// what a missing transcript means to a visitor.
export async function readTranscript(
  slug: string,
  directory: string = transcriptsDirectory,
  patientsDir?: string,
): Promise<Transcript | undefined> {
  const filename = `${slug}.mdx`;
  const filenames = await transcriptFilenames(directory);

  if (!filenames.includes(filename)) {
    return undefined;
  }

  const designations = await patientDesignations(patientsDir);

  // The frontmatter has to be known before the body is compiled, because the
  // component map depends on it — so it is read first, by the same compile
  // path everything else uses. One parser, called twice, rather than two
  // parsers that could disagree about the same file.
  const frontmatter = await readFrontmatter(directory, filename);
  const cast = resolveCast(filename, frontmatter, designations);

  const source = await readFile(path.join(directory, filename), "utf8");

  validateSpeakers(filename, source, cast, frontmatter.clinician);

  // Decision D6, and the one place this collection's component map cannot be
  // the constant Phase 6's is: <Turn speaker="mallow-1"> has to render the
  // patient's designation and link to their chart, so the map has to know
  // this transcript's cast. It is built here, per transcript, and nowhere
  // else.
  const { content } = await compileMDX<Record<string, unknown>>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
    components: {
      ...mdxComponents,
      ...transcriptComponents({
        filename,
        cast,
        clinician: frontmatter.clinician,
      }),
    },
  });

  return { slug, frontmatter, cast, body: content };
}
