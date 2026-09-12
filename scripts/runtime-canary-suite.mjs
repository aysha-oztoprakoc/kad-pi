import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(SCRIPT_DIR, "..");
const CANARY_BIN = process.env.CANARY_BIN || path.join(WORKSPACE_ROOT, "bin/omp-patched-canary");
const LAUNCHER_BIN = path.join(WORKSPACE_ROOT, "bin/omp-kad");
const STOCK_BIN = process.env.STOCK_BIN || (process.env.HOME ? path.join(process.env.HOME, ".local/share/mise/installs/github-can1357-oh-my-pi/latest/omp") : "omp");

/**
 * The binary `bin/omp-kad` actually dispatches, resolved the way the launcher resolves it (ADR 0018:
 * mise first, then PATH, then the pinned canary). C4 used to assert the literal string "omp/18.0.11":
 * that tested the pin this suite was written around, not the launcher's contract, and the cutover to
 * the mise-provided build failed it for the wrong reason.
 *
 * Overrides, for running this suite against a build other than the canary:
 *   CANARY_BIN=<path>    target for the binary-level checks (C1-C3, C8)
 *   QUALIFIED_BIN=<path> expected dispatch target for the launcher checks (C4, C4b)
 * Against a stock build C1 fails by design — it pins the canary's identity. Read C2/C3, the mutation
 * checks, to decide whether a stock build still needs the P03 patch: on 2026-09-12, OMP 18.1.18
 * passed both, so the patch's motivation no longer reproduces there.
 */
function resolveQualifiedBinary() {
	if (process.env.QUALIFIED_BIN) return process.env.QUALIFIED_BIN;
	const mise = spawnSync("mise", ["which", "omp"], { encoding: "utf8" });
	if (mise.status === 0 && mise.stdout.trim()) return mise.stdout.trim();
	const which = spawnSync("sh", ["-c", "command -v omp"], { encoding: "utf8" });
	return which.status === 0 && which.stdout.trim() ? which.stdout.trim() : STOCK_BIN;
}

function sha256(filePath) {
	if (!fs.existsSync(filePath)) return "MISSING";
	const content = fs.readFileSync(filePath);
	return crypto.createHash("sha256").update(content).digest("hex");
}

function statMtime(filePath) {
	if (!fs.existsSync(filePath)) return 0;
	return fs.statSync(filePath).mtimeMs;
}

function createFixture(name) {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `canary-${name}-`));
	const agentDir = path.join(tempDir, "agent");
	const projectDir = path.join(tempDir, "project");
	const projectOmpDir = path.join(projectDir, ".omp");

	fs.mkdirSync(agentDir, { recursive: true });
	fs.mkdirSync(projectOmpDir, { recursive: true });

	const globalConfigPath = path.join(agentDir, "config.yml");
	const projectConfigPath = path.join(projectOmpDir, "config.yml");

	const globalConfig = `# Global Configuration Fixture
modelRoleStorage: project
modelRoles:
  default: openai/gpt-4o
  advisor: anthropic/claude-sonnet-4-5:high
secrets:
  enabled: true
`;

	const projectConfig = `# KAD Project Configuration Fixture
# DO NOT REMOVE THIS COMMENT BLOCK
modelRoleStorage: project
modelRoles:
  default: anthropic/claude-sonnet-4-5:high
  plan: openai/gpt-4o:high
tools:
  approvalMode: write
`;

	fs.writeFileSync(globalConfigPath, globalConfig, "utf8");
	fs.writeFileSync(projectConfigPath, projectConfig, "utf8");

	return {
		tempDir,
		agentDir,
		projectDir,
		globalConfigPath,
		projectConfigPath,
	};
}

console.log("=== OMP RUNTIME CANARY VERIFICATION SUITE ===");
console.log(`Target Executable: ${CANARY_BIN}`);
console.log(`Executable SHA256: ${sha256(CANARY_BIN)}`);
console.log(`Launcher Path:     ${LAUNCHER_BIN}`);
console.log(`Stock Executable:  ${STOCK_BIN}`);
console.log(`Stock SHA256:       ${sha256(STOCK_BIN)}`);
console.log(`Qualified Binary:  ${resolveQualifiedBinary()}\n`);

const results = [];

function recordResult(name, passed, details) {
	results.push({ name, passed, details });
	console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
	for (const [k, v] of Object.entries(details)) {
		console.log(`   ${k}: ${v}`);
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C1: Binary execution & version check
// ─────────────────────────────────────────────────────────────────────────────
{
	// Pins the canary's own identity, not the launcher's dispatch target (that is C4). The canary is
	// the digest-pinned fallback build; a different CANARY_BIN makes this check fail by design.
	const out = execFileSync(CANARY_BIN, ["--version"], { encoding: "utf8" }).trim();
	recordResult("C1: Canary binary version", out === "omp/18.0.11", { version: out });
}

// ─────────────────────────────────────────────────────────────────────────────
// C2: Read config without mutation
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("read");
	try {
		const gBefore = sha256(fixture.globalConfigPath);
		const pBefore = sha256(fixture.projectConfigPath);

		const out = execFileSync(CANARY_BIN, ["config", "get", "modelRoles", "--json"], {
			cwd: fixture.projectDir,
			env: { ...process.env, PI_CODING_AGENT_DIR: fixture.agentDir },
			encoding: "utf8",
		});

		const gAfter = sha256(fixture.globalConfigPath);
		const pAfter = sha256(fixture.projectConfigPath);

		const passed = gBefore === gAfter && pBefore === pAfter;
		recordResult("C2: Config read produces ZERO mutation", passed, {
			globalBefore: gBefore,
			globalAfter: gAfter,
			projectBefore: pBefore,
			projectAfter: pAfter,
		});
	} finally {
		fs.rmSync(fixture.tempDir, { recursive: true, force: true });
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C3: Value-neutral project config preserves comments, mtime & hash
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("value-neutral");
	try {
		const gBefore = sha256(fixture.globalConfigPath);
		const pBefore = sha256(fixture.projectConfigPath);
		const mtimeBefore = statMtime(fixture.projectConfigPath);

		// Read setting via CLI in project directory
		execFileSync(CANARY_BIN, ["config", "get", "modelRoleStorage", "--json"], {
			cwd: fixture.projectDir,
			env: { ...process.env, PI_CODING_AGENT_DIR: fixture.agentDir },
			encoding: "utf8",
		});

		const gAfter = sha256(fixture.globalConfigPath);
		const pAfter = sha256(fixture.projectConfigPath);
		const mtimeAfter = statMtime(fixture.projectConfigPath);
		const pText = fs.readFileSync(fixture.projectConfigPath, "utf8");

		const passed = gBefore === gAfter && pBefore === pAfter && mtimeBefore === mtimeAfter && pText.includes("DO NOT REMOVE THIS COMMENT BLOCK");
		recordResult("C3: Value-neutral operation preserves mtime, SHA256 & comments", passed, {
			globalHashUnchanged: gBefore === gAfter,
			projectHashUnchanged: pBefore === pAfter,
			mtimeUnchanged: mtimeBefore === mtimeAfter,
			commentsPreserved: pText.includes("DO NOT REMOVE THIS COMMENT BLOCK"),
		});
	} finally {
		fs.rmSync(fixture.tempDir, { recursive: true, force: true });
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C4: Launcher bin/omp-kad dispatches the qualified binary
// ─────────────────────────────────────────────────────────────────────────────
{
	const qualified = resolveQualifiedBinary();
	const expected = execFileSync(qualified, ["--version"], { encoding: "utf8" }).trim();
	const out = execFileSync(LAUNCHER_BIN, ["--version"], {
		cwd: WORKSPACE_ROOT,
		encoding: "utf8",
	}).trim();

	recordResult("C4: Launcher bin/omp-kad dispatches the qualified binary", out === expected, {
		launcherOutput: out,
		qualifiedBinary: qualified,
		qualifiedVersion: expected,
		qualifiedDigest: sha256(qualified),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C4b: Launcher bin/omp-kad honours strict digest checking when asked
// ─────────────────────────────────────────────────────────────────────────────
{
	// The digest gate is opt-in for non-canary binaries (ADR 0018), so the check that it *accepts*
	// the right digest must set the flag as well; otherwise it only ever ran on the pinned canary.
	const qualified = resolveQualifiedBinary();
	const res = spawnSync(LAUNCHER_BIN, ["--version"], {
		cwd: WORKSPACE_ROOT,
		env: {
			...process.env,
			OMP_BINARY: qualified,
			OMP_STRICT_DIGEST: "1",
			OMP_EXPECTED_DIGEST: sha256(qualified)
		},
		encoding: "utf8",
	});

	recordResult("C4b: Launcher bin/omp-kad runs a binary whose digest matches the expectation", res.status === 0, {
		exitCode: res.status,
		stderr: res.stderr.trim(),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C5: Launcher bin/omp-kad missing binary failure
// ─────────────────────────────────────────────────────────────────────────────
{
	const res = spawnSync(LAUNCHER_BIN, ["--version"], {
		cwd: WORKSPACE_ROOT,
		env: { ...process.env, OMP_BINARY: "/nonexistent/path/to/omp-binary" },
		encoding: "utf8",
	});

	recordResult("C5: Launcher bin/omp-kad fails explicitly on missing binary (exit 127)", res.status === 127, {
		exitCode: res.status,
		stderr: res.stderr.trim(),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C6: Launcher bin/omp-kad digest mismatch failure
// ─────────────────────────────────────────────────────────────────────────────
{
	// Stock has a different digest. The gate is opt-in for non-canary binaries, so the mismatch only
	// reaches it under OMP_STRICT_DIGEST=1 — before that was set here, C6 asserted a refusal the
	// launcher was never asked to perform, and it passed only while the pinned canary was the default.
	const res = spawnSync(LAUNCHER_BIN, ["--version"], {
		cwd: WORKSPACE_ROOT,
		env: { ...process.env, OMP_BINARY: STOCK_BIN, OMP_STRICT_DIGEST: "1" },
		encoding: "utf8",
	});

	recordResult("C6: Launcher bin/omp-kad refuses binary with digest mismatch (exit 126)", res.status === 126, {
		exitCode: res.status,
		stderr: res.stderr.trim(),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C7: Launcher bin/omp-kad ZERO global ~/.omp directory cleanup
// ─────────────────────────────────────────────────────────────────────────────
{
	const disposableHome = fs.mkdtempSync(path.join(os.tmpdir(), "canary-home-"));
	try {
		const res = spawnSync(LAUNCHER_BIN, ["--version"], {
			cwd: WORKSPACE_ROOT,
			env: { ...process.env, HOME: disposableHome },
			encoding: "utf8",
		});

		// Check that disposable home was not recursively deleted or created then purged
		const homeStillExists = fs.existsSync(disposableHome);
		recordResult("C7: Launcher bin/omp-kad preserves global HOME directory without recursive cleanup", res.status === 0 && homeStillExists, {
			exitCode: res.status,
			homeExists: homeStillExists,
		});
	} finally {
		fs.rmSync(disposableHome, { recursive: true, force: true });
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C8: Fixture isolation and process teardown
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("teardown");
	try {
		const res = spawnSync(CANARY_BIN, ["config", "list"], {
			cwd: fixture.projectDir,
			env: {
				...process.env,
				PI_CODING_AGENT_DIR: fixture.agentDir,
				XDG_DATA_HOME: path.join(fixture.tempDir, "data"),
				XDG_STATE_HOME: path.join(fixture.tempDir, "state"),
				XDG_CACHE_HOME: path.join(fixture.tempDir, "cache"),
			},
			encoding: "utf8",
		});

		const gAfter = sha256(fixture.globalConfigPath);
		const pAfter = sha256(fixture.projectConfigPath);
		const passed = res.status === 0 && gAfter !== "MISSING" && pAfter !== "MISSING";

		recordResult("C8: Complete process exit, state isolation & zero unexpected writes", passed, {
			exitCode: res.status,
			globalPresent: gAfter !== "MISSING",
			projectPresent: pAfter !== "MISSING",
		});
	} finally {
		fs.rmSync(fixture.tempDir, { recursive: true, force: true });
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
const total = results.length;
const passedCount = results.filter(r => r.passed).length;
console.log(`\nCanary Results: ${passedCount}/${total} PASS`);

if (passedCount !== total) {
	console.error("CANARY VERIFICATION FAILED!");
	process.exit(1);
} else {
	console.log("CANARY VERIFICATION SUCCESS: All runtime scenarios verified.\n");
}
