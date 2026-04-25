import { execSync } from "child_process";
import { existsSync } from "fs";
import { CONFIG } from "./config";
import { log } from "./logger";

const logger = log.scope("deploy");

export interface DeployStep {
  name: string;
  status: "pending" | "running" | "success" | "skipped" | "failed";
  output?: string;
  duration?: number;
}

export interface DeployResult {
  success: boolean;
  steps: DeployStep[];
  projectSlug: string;
  projectPath: string;
  commitSha?: string;
  pm2Restarted?: boolean;
  empireUpdated?: boolean;
}

/**
 * Run une commande shell avec timeout + capture stdout.
 */
function runCmd(cmd: string, cwd: string, timeout = 30_000): { ok: boolean; out: string; code: number } {
  try {
    const out = execSync(cmd, { cwd, timeout, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, out: out.toString().slice(-2000), code: 0 };
  } catch (err) {
    const e = err as { stdout?: Buffer; stderr?: Buffer; status?: number; message?: string };
    const out = (e.stdout?.toString() || "") + "\n" + (e.stderr?.toString() || e.message || "");
    return { ok: false, out: out.slice(-2000), code: e.status || 1 };
  }
}

/**
 * Workflow : git status → add → commit → push → pm2 restart → empire sync
 */
export async function deployProject(projectSlug: string, projectPath: string, commitMsg?: string): Promise<DeployResult> {
  const result: DeployResult = {
    success: false,
    steps: [],
    projectSlug,
    projectPath,
  };

  if (!existsSync(projectPath)) {
    result.steps.push({ name: "validate-path", status: "failed", output: `Path not found: ${projectPath}` });
    return result;
  }

  // 1. Git status (skip si rien à committer)
  const t0 = Date.now();
  const status = runCmd("git status --porcelain", projectPath);
  if (!status.ok) {
    result.steps.push({ name: "git-status", status: "failed", output: status.out, duration: Date.now() - t0 });
    return result;
  }
  const hasChanges = status.out.trim().length > 0;
  result.steps.push({ name: "git-status", status: "success", output: hasChanges ? `${status.out.split("\n").length} files changed` : "no changes", duration: Date.now() - t0 });

  let commitSha = "";

  if (hasChanges) {
    // 2. Git add
    const t1 = Date.now();
    const add = runCmd("git add -A", projectPath);
    result.steps.push({ name: "git-add", status: add.ok ? "success" : "failed", output: add.out, duration: Date.now() - t1 });
    if (!add.ok) return result;

    // 3. Git commit
    const t2 = Date.now();
    const msg = commitMsg || `feat: paul-architect pipeline update ${new Date().toISOString().slice(0, 16)}`;
    const commit = runCmd(`git commit -m "${msg.replace(/"/g, '\\"')}"`, projectPath);
    result.steps.push({ name: "git-commit", status: commit.ok ? "success" : "failed", output: commit.out, duration: Date.now() - t2 });
    if (!commit.ok) return result;

    // Récup le SHA
    const sha = runCmd("git rev-parse --short HEAD", projectPath);
    if (sha.ok) {
      commitSha = sha.out.trim();
      result.commitSha = commitSha;
    }

    // 4. Git push (best-effort, skip si pas de remote)
    const t3 = Date.now();
    const remote = runCmd("git remote", projectPath);
    if (remote.ok && remote.out.trim().length > 0) {
      const push = runCmd("git push 2>&1", projectPath, 60_000);
      result.steps.push({ name: "git-push", status: push.ok ? "success" : "failed", output: push.out.slice(-500), duration: Date.now() - t3 });
    } else {
      result.steps.push({ name: "git-push", status: "skipped", output: "no remote", duration: 0 });
    }
  } else {
    result.steps.push({ name: "git-add", status: "skipped", output: "no changes" });
    result.steps.push({ name: "git-commit", status: "skipped" });
    result.steps.push({ name: "git-push", status: "skipped" });
  }

  // 5. PM2 restart (best-effort, projet doit exister dans PM2)
  const t4 = Date.now();
  const pm2Check = runCmd(`/usr/bin/pm2 list --no-color 2>&1 | grep -E "^\\s*[0-9]+\\s+\\\\|\\s+${projectSlug}\\s"`, "/", 5_000);
  if (pm2Check.ok || pm2Check.out.includes(projectSlug)) {
    const restart = runCmd(`sudo /usr/bin/pm2 restart ${projectSlug} --update-env 2>&1`, "/", 15_000);
    result.steps.push({ name: "pm2-restart", status: restart.ok ? "success" : "failed", output: restart.out.slice(-300), duration: Date.now() - t4 });
    result.pm2Restarted = restart.ok;
  } else {
    result.steps.push({ name: "pm2-restart", status: "skipped", output: `${projectSlug} not in PM2`, duration: Date.now() - t4 });
  }

  // 6. EmpireDONE sync (POST progression)
  const t5 = Date.now();
  try {
    const res = await fetch(`${CONFIG.EMPIRE_API}/api/projects/${projectSlug}/deploy-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commitSha,
        timestamp: new Date().toISOString(),
        source: "paul-architect",
      }),
      signal: AbortSignal.timeout(5_000),
    });
    const ok = res.ok || res.status === 404; // 404 OK : endpoint optionnel
    result.steps.push({ name: "empire-sync", status: ok ? "success" : "failed", output: `HTTP ${res.status}`, duration: Date.now() - t5 });
    result.empireUpdated = ok;
  } catch (err) {
    result.steps.push({ name: "empire-sync", status: "skipped", output: String(err).slice(0, 100), duration: Date.now() - t5 });
  }

  const failed = result.steps.filter((s) => s.status === "failed").length;
  result.success = failed === 0;
  logger.info("deploy complete", { projectSlug, success: result.success, steps: result.steps.length, commitSha });
  return result;
}
