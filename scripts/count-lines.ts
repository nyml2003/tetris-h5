import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

interface FileSummary {
  filePath: string;
  extension: string;
  group: string;
  totalLines: number;
  nonEmptyLines: number;
}

interface AggregateSummary {
  files: number;
  totalLines: number;
  nonEmptyLines: number;
}

const codeExtensions = new Set([
  ".css",
  ".cts",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".mts",
  ".ts",
  ".tsx",
]);

const ignoredDirectories = new Set([
  ".git",
  ".vite",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const numberFormatter = new Intl.NumberFormat("en-US");

async function collectCodeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedResults = await Promise.all(
    entries.flatMap(async (entry) => {
      const entryPath = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) {
          return [];
        }

        return collectCodeFiles(entryPath);
      }

      return codeExtensions.has(extname(entry.name)) ? [entryPath] : [];
    }),
  );

  return nestedResults.flat();
}

function countLines(content: string): AggregateSummary {
  if (content.length === 0) {
    return { files: 1, totalLines: 0, nonEmptyLines: 0 };
  }

  const lines = content.split(/\r?\n/u);
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0).length;

  return {
    files: 1,
    totalLines: lines.length,
    nonEmptyLines,
  };
}

function getTopLevelGroup(filePath: string): string {
  const relativePath = relative(repoRoot, filePath);
  const [group] = relativePath.split(sep);

  return relativePath.includes(sep) ? group ?? "(root)" : "(root)";
}

function addToAggregate(
  target: Map<string, AggregateSummary>,
  key: string,
  summary: AggregateSummary,
): void {
  const current = target.get(key) ?? {
    files: 0,
    totalLines: 0,
    nonEmptyLines: 0,
  };

  current.files += summary.files;
  current.totalLines += summary.totalLines;
  current.nonEmptyLines += summary.nonEmptyLines;

  target.set(key, current);
}

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatAggregateLine(label: string, summary: AggregateSummary): string {
  const files = pad(formatNumber(summary.files), 5);
  const totalLines = pad(formatNumber(summary.totalLines), 7);
  const nonEmptyLines = pad(formatNumber(summary.nonEmptyLines), 9);

  return `${pad(label, 12)} files ${files} total ${totalLines} non-empty ${nonEmptyLines}`;
}

async function summarizeFile(filePath: string): Promise<FileSummary> {
  const content = await readFile(filePath, "utf8");
  const lineCounts = countLines(content);

  return {
    filePath,
    extension: extname(filePath) || "(none)",
    group: getTopLevelGroup(filePath),
    totalLines: lineCounts.totalLines,
    nonEmptyLines: lineCounts.nonEmptyLines,
  };
}

function sortAggregateEntries(
  entries: [string, AggregateSummary][],
): [string, AggregateSummary][] {
  return entries.sort((left, right) => {
    const [, leftSummary] = left;
    const [, rightSummary] = right;

    if (rightSummary.totalLines !== leftSummary.totalLines) {
      return rightSummary.totalLines - leftSummary.totalLines;
    }

    return left[0].localeCompare(right[0]);
  });
}

async function main(): Promise<void> {
  const codeFiles = await collectCodeFiles(repoRoot);
  const fileSummaries = await Promise.all(codeFiles.map((filePath) => summarizeFile(filePath)));

  const totals: AggregateSummary = {
    files: 0,
    totalLines: 0,
    nonEmptyLines: 0,
  };
  const byExtension = new Map<string, AggregateSummary>();
  const byGroup = new Map<string, AggregateSummary>();

  for (const summary of fileSummaries) {
    const counts: AggregateSummary = {
      files: 1,
      totalLines: summary.totalLines,
      nonEmptyLines: summary.nonEmptyLines,
    };

    totals.files += counts.files;
    totals.totalLines += counts.totalLines;
    totals.nonEmptyLines += counts.nonEmptyLines;

    addToAggregate(byExtension, summary.extension, counts);
    addToAggregate(byGroup, summary.group, counts);
  }

  console.log(`Code line summary for ${repoRoot}`);
  console.log(formatAggregateLine("all files", totals));
  console.log("");
  console.log("By extension:");

  const extensionEntries = sortAggregateEntries(Array.from(byExtension.entries()));

  for (const [extension, summary] of extensionEntries) {
    console.log(formatAggregateLine(extension, summary));
  }

  console.log("");
  console.log("By top-level path:");

  const groupEntries = sortAggregateEntries(Array.from(byGroup.entries()));

  for (const [group, summary] of groupEntries) {
    console.log(formatAggregateLine(group, summary));
  }
}

void main();
