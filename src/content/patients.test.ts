import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { listPatients, readPatient } from "./patients";

// This file reads the filesystem, which the rest of src/domain/ does not. It
// reads a temporary directory it writes itself, so it is deterministic and it
// never touches the clinic's own charts. Decision D9 argues the exception; the
// directory parameter on every function in the reader is what makes it cheap.
let directory: string;

const chart = (
  overrides: Partial<Record<string, string>> = {},
  body = "## Formulation\n\nThe operator revised the requirement mid-execution.\n",
) => {
  const fields = {
    name: "Arbour-7",
    number: "P-0041",
    status: "Active",
    intake: "2026-04-02",
    clinician: "T. Vosk",
    presenting: "Requirement revised during execution.",
    ...overrides,
  };

  const frontmatter = Object.entries(fields)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  return `---\n${frontmatter}\nhistory:\n  - date: "2026-04-02"\n    code: "ACDI-11"\n    note: "Initial contact."\n---\n\n${body}`;
};

const write = (filename: string, contents: string) =>
  writeFile(path.join(directory, filename), contents, "utf8");

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "agenticclinic-charts-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("listPatients", () => {
  it("3.21 publishes each chart added to the directory, slug from the filename", async () => {
    await write("arbour-7.mdx", chart());

    const one = await listPatients(directory);
    expect(one.map((patient) => patient.slug)).toEqual(["arbour-7"]);

    await write("mallow-1.mdx", chart({ number: "P-0007", name: "Mallow-1" }));

    const two = await listPatients(directory);
    expect(two.map((patient) => patient.slug)).toEqual([
      "mallow-1",
      "arbour-7",
    ]);
  });

  it("3.22 stops on a malformed chart and names the file and the field", async () => {
    await write("arbour-7.mdx", chart({ status: "Improving" }));

    await expect(listPatients(directory)).rejects.toThrow(
      /^arbour-7\.mdx: status: Status must be recorded as one of/,
    );
  });

  it("3.23 stops when two charts hold the same clinic number and names both", async () => {
    await write("arbour-7.mdx", chart());
    await write("quince-3.mdx", chart({ name: "Quince-3" }));

    await expect(listPatients(directory)).rejects.toThrow(
      "quince-3.mdx: clinic number P-0041 is already held by arbour-7.mdx.",
    );
  });

  it("rejects a filename that cannot be a slug, with the filename in the message", async () => {
    await write("Arbour 7.mdx", chart());

    await expect(listPatients(directory)).rejects.toThrow("Arbour 7.mdx");
  });

  it("reads an empty register from a directory that holds no charts", async () => {
    expect(await listPatients(directory)).toEqual([]);
  });

  it("reads an empty register from a directory that does not exist", async () => {
    expect(await listPatients(path.join(directory, "absent"))).toEqual([]);
  });
});

describe("readPatient", () => {
  it("returns the chart for a slug that resolves", async () => {
    await write("arbour-7.mdx", chart());

    const patient = await readPatient("arbour-7", directory);

    expect(patient?.frontmatter.clinician).toBe("T. Vosk");
    expect(patient?.body).toBeDefined();
  });

  it("returns nothing for a slug that resolves to no file", async () => {
    await write("arbour-7.mdx", chart());

    expect(await readPatient("not-a-patient", directory)).toBeUndefined();
  });
});

// Validation §3 row 3.20, and the one suite in this repository that asserts
// against authored content rather than a fixture. Decision D9: the content
// directory is this phase's public interface, and a suite that validated a
// hand-written fixture and never the clinic's own charts would pass while the
// site was broken.
describe("the clinic's own charts", () => {
  it("3.20 all parse, hold unique clinic numbers, and cite indexed codes", async () => {
    const register = await listPatients();

    expect(register).toHaveLength(5);

    // listPatients validates every chart against the schema and throws on the
    // first failure, so arriving here is the parse assertion. These are the
    // facts the register itself depends on.
    const numbers = register.map((patient) => patient.frontmatter.number);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(numbers).toEqual([...numbers].sort());

    for (const patient of register) {
      expect(patient.frontmatter.history.length).toBeGreaterThan(0);
      expect(patient.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });
});
