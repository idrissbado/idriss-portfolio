import { spawnSync } from "node:child_process";
import path from "node:path";

const BASELINE_MIGRATION = "0_init";
const MAX_LOCK_RETRIES = 4;
const LOCK_RETRY_DELAY_MS = 12_000;
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

function getOutput(result) {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function deployWithLockRetry() {
  for (let attempt = 0; attempt <= MAX_LOCK_RETRIES; attempt += 1) {
    const result = runPrisma(["migrate", "deploy"]);
    const output = getOutput(result);

    if (
      result.status === 0 ||
      !output.includes("P1002") ||
      !output.includes("advisory lock") ||
      attempt === MAX_LOCK_RETRIES
    ) {
      return result;
    }

    console.warn(
      `Another deployment holds the Prisma migration lock. Retrying in ${LOCK_RETRY_DELAY_MS / 1000} seconds (${attempt + 1}/${MAX_LOCK_RETRIES}).`,
    );
    await wait(LOCK_RETRY_DELAY_MS);
  }

  throw new Error("Prisma migration retry loop ended unexpectedly.");
}

const initialDeploy = await deployWithLockRetry();

if (initialDeploy.status === 0) {
  process.exit(0);
}

const initialOutput = getOutput(initialDeploy);

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

const retryDeploy = await deployWithLockRetry();
exitWithResult(retryDeploy);
