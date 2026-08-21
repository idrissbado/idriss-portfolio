import { spawnSync } from "node:child_process";
import path from "node:path";

const BASELINE_MIGRATION = "0_init";
const prismaCli = path.resolve(process.cwd(), "node_modules/prisma/build/index.js");

function runPrisma(args) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result;
}

function exitWithResult(result) {
  process.exit(result.status ?? 1);
}

const initialDeploy = runPrisma(["migrate", "deploy"]);

if (initialDeploy.status === 0) {
  process.exit(0);
}

const initialOutput = `${initialDeploy.stdout ?? ""}\n${initialDeploy.stderr ?? ""}`;

if (!initialOutput.includes("P3005")) {
  exitWithResult(initialDeploy);
}

console.warn(
  `Existing database detected without Prisma migration history. Marking ${BASELINE_MIGRATION} as applied before retrying.`,
);

const baseline = runPrisma(["migrate", "resolve", "--applied", BASELINE_MIGRATION]);

if (baseline.status !== 0) {
  exitWithResult(baseline);
}

const retryDeploy = runPrisma(["migrate", "deploy"]);
exitWithResult(retryDeploy);
