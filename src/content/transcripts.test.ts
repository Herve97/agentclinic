import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  listTranscripts,
  readTranscript,
  transcriptsDirectory,
} from "./transcripts";
import { patientsDirectory } from "./patients";

// Phase 6's decision D9, applied to the second collection: this is the file
// that is allowed to read the disk, and it says why.
//
// Two kinds of test live here. The temporary-directory tests write their own
// fixtures and remove them, so they depend on nothing the repository happens
// to contain. The content-integrity test reads the clinic's real transcripts
// and real charts on purpose — it is the test that would catch a cast naming a
// patient who has been renamed, which is the whole argument of decision D5 and
// is not a property any fixture can assert.
//
// Both are deterministic. Neither reads the clock or the database.

const chart = (name: string, number: string) => `---
name: "${name}"
number: "${number}"
status: "Active"
intake: "2026-01-05"
clinician: "T. Vosk"
presenting: "A fixture."
history:
  - date: "2026-01-05"
    code: "ACDI-01"
    note: "A fixture."
---

## Formulation

A fixture.
`;

const transcript = (cast: string[], date = "2026-03-04") => `---
title: "Group session"
date: "${date}"
clinician: "T. Vosk"
setting: "Group room 2"
cast:
${cast.map((slug) => `  - ${slug}`).join("\n")}
summary: "A fixture."
---

<Turn speaker="${cast[0]}" at="00:04">
  A fixture.
</Turn>
`;

let root: string;
let transcripts: string;
let patients: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "agentclinic-transcripts-"));
  transcripts = path.join(root, "transcripts");
  patients = path.join(root, "patients");
  await mkdir(transcripts);
  await mkdir(patients);
  await writeFile(
    path.join(patients, "mallow-1.mdx"),
    chart("Mallow-1", "P-0007"),
    "utf8",
  );
  await writeFile(
    path.join(patients, "arbour-7.mdx"),
    chart("Arbour-7", "P-0041"),
    "utf8",
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("listTranscripts", () => {
  it("3.18 discovers each transcript and derives its slug", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      transcript(["mallow-1"], "2026-03-04"),
      "utf8",
    );

    expect(
      (await listTranscripts(transcripts, patients)).map((t) => t.slug),
    ).toEqual(["group-a"]);

    await writeFile(
      path.join(transcripts, "group-b.mdx"),
      transcript(["arbour-7"], "2026-06-02"),
      "utf8",
    );

    const found = await listTranscripts(transcripts, patients);

    // Newest first, which is decision D7 observed through the reader rather
    // than asserted against transcriptOrder a second time.
    expect(found.map((t) => t.slug)).toEqual(["group-b", "group-a"]);
  });

  it("3.19 throws on a malformed transcript, naming the file and the field", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      transcript(["mallow-1"]).replace('clinician: "T. Vosk"\n', ""),
      "utf8",
    );

    await expect(listTranscripts(transcripts, patients)).rejects.toThrow(
      /^group-a\.mdx: clinician: /,
    );
  });

  it("3.20 throws when a cast names a patient who does not exist", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      transcript(["mallow-1", "mallow-2"]),
      "utf8",
    );

    await expect(listTranscripts(transcripts, patients)).rejects.toThrow(
      'group-a.mdx: cast.1: no patient chart exists for "mallow-2".',
    );
  });

  it("resolves each cast slug to the patient's designation", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      transcript(["mallow-1", "arbour-7"]),
      "utf8",
    );

    const [session] = await listTranscripts(transcripts, patients);

    expect(session.cast).toEqual([
      { slug: "mallow-1", name: "Mallow-1" },
      { slug: "arbour-7", name: "Arbour-7" },
    ]);
  });

  it("returns an empty list for an absent directory rather than throwing", async () => {
    expect(
      await listTranscripts(path.join(root, "nothing-here"), patients),
    ).toEqual([]);
  });
});

describe("readTranscript", () => {
  it("returns nothing for a slug with no file, so the route can 404", async () => {
    expect(
      await readTranscript("not-a-session", transcripts, patients),
    ).toBeUndefined();
  });

  it("3.21 throws when a speaker is neither in the cast nor the clinician", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      `${transcript(["mallow-1"])}
<Turn speaker="quince-3" at="00:09">
  Not in the cast.
</Turn>
`,
      "utf8",
    );

    await expect(
      readTranscript("group-a", transcripts, patients),
    ).rejects.toThrow(
      'group-a.mdx: "quince-3" speaks but is not in the cast and is not "clinician".',
    );
  });

  it("compiles a transcript whose speakers are the cast and the clinician", async () => {
    await writeFile(
      path.join(transcripts, "group-a.mdx"),
      `${transcript(["mallow-1"])}
<Turn speaker="clinician" at="00:09">
  Facilitating.
</Turn>
`,
      "utf8",
    );

    const session = await readTranscript("group-a", transcripts, patients);

    expect(session?.frontmatter.title).toBe("Group session");
    expect(session?.cast).toEqual([{ slug: "mallow-1", name: "Mallow-1" }]);
    expect(session?.body).toBeDefined();
  });
});

describe("the clinic's own transcripts", () => {
  it("3.22 every authored transcript validates and every cast member resolves", async () => {
    const sessions = await listTranscripts(
      transcriptsDirectory,
      patientsDirectory,
    );

    expect(sessions.length).toBeGreaterThanOrEqual(3);

    for (const session of sessions) {
      expect(session.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(session.frontmatter.cast.length).toBeGreaterThan(0);
      // resolveCast throws rather than returning a hole, so an entry here is
      // proof the chart exists; the assertion is that the counts agree.
      expect(session.cast).toHaveLength(session.frontmatter.cast.length);
    }

    // Decision D7, against the real collection: newest first.
    const dates = sessions.map((s) => s.frontmatter.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("3.22 every speaker in every authored transcript resolves", async () => {
    const sessions = await listTranscripts(
      transcriptsDirectory,
      patientsDirectory,
    );

    // readTranscript throws on an unresolvable speaker, so compiling all three
    // is the assertion. This is the row that would catch a turn attributed to
    // a patient who left the cast during an edit.
    for (const { slug } of sessions) {
      const session = await readTranscript(
        slug,
        transcriptsDirectory,
        patientsDirectory,
      );

      expect(session?.body).toBeDefined();
    }
  });
});
