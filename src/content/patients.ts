import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import remarkGfm from "remark-gfm";

import {
  parsePatientFrontmatter,
  registerOrder,
  slugFromFilename,
  type PatientFrontmatter,
  type PatientRecord,
} from "@/domain/patient";

import { mdxComponents } from "./mdx-components";

// Phase 6, decision D9. **This is the only module in the phase that touches the
// filesystem.** Everything it hands back has been through the Zod schema in
// src/domain/patient.ts, which is pure and tested on its own.
//
// Every function takes the directory as a parameter, defaulting to the real
// one, so the tests can point it at a temporary directory rather than at the
// clinic's own charts.

export const patientsDirectory = path.join(
  process.cwd(),
  "src",
  "content",
  "patients",
);

export type PatientChart = {
  slug: string;
  frontmatter: PatientFrontmatter;
  body: ReactElement;
};

// A directory that does not exist is an empty register, not a crash. Git does
// not track empty directories, so a repository whose charts were all removed
// would arrive without this folder at all, and plan step 5.8 is explicit that
// there is no state of the repository where this page should look broken.
async function chartFilenames(directory: string): Promise<string[]> {
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

// Decision D2: compiled from src/content/ at build time, from a file in the
// repository. Nothing is fetched, which is the offline constraint in
// specs/mission.md.
async function compileChart(directory: string, filename: string) {
  const source = await readFile(path.join(directory, filename), "utf8");

  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
    components: mdxComponents,
  });

  // Decision D4: the file is validated as it is read, and an invalid one stops
  // the build with its own name in the message. A register that renders four
  // of five charts and says nothing about the fifth is worse than a build that
  // stops.
  return {
    frontmatter: parsePatientFrontmatter(filename, frontmatter),
    body: content,
  };
}

export async function listPatients(
  directory: string = patientsDirectory,
): Promise<PatientRecord[]> {
  const filenames = await chartFilenames(directory);
  const records: PatientRecord[] = [];

  // The one check a per-file schema cannot make. Two charts sharing a clinic
  // number is a copy-paste that would otherwise publish twice and read as one
  // patient filed under two slugs.
  const numbers = new Map<string, string>();

  for (const filename of filenames) {
    const slug = slugFromFilename(filename);
    const { frontmatter } = await compileChart(directory, filename);
    const held = numbers.get(frontmatter.number);

    if (held !== undefined) {
      throw new Error(
        `${filename}: clinic number ${frontmatter.number} is already held by ${held}.`,
      );
    }

    numbers.set(frontmatter.number, filename);
    records.push({ slug, frontmatter });
  }

  return registerOrder(records);
}

// Decision D8: a slug that resolves to no file is absent, not an error. The
// route turns that into a 404; nothing here decides what a missing chart means
// to a visitor.
export async function readPatient(
  slug: string,
  directory: string = patientsDirectory,
): Promise<PatientChart | undefined> {
  const filename = `${slug}.mdx`;
  const filenames = await chartFilenames(directory);

  if (!filenames.includes(filename)) {
    return undefined;
  }

  const { frontmatter, body } = await compileChart(directory, filename);

  return { slug, frontmatter, body };
}
