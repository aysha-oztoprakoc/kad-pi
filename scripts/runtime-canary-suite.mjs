import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(SCRIPT_DIR, "..");
const CANARY_BIN = process.env.CANARY_BIN || path.join(WORKSPACE_ROOT, "bin/omp-patched-canary");
const STOCK_BIN = process.env.STOCK_BIN || (process.env.HOME ? path.join(process.env.HOME, ".local/share/mise/installs/github-can1357-oh-my-pi/latest/omp") : "omp");
const OMP_SOURCE_DIR = process.env.OMP_SOURCE_DIR || "/tmp/oh-my-pi";
const OMP_PKG_DIR = path.join(OMP_SOURCE_DIR, "packages/coding-agent");

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
console.log(`Stock Executable:  ${STOCK_BIN}`);
console.log(`Stock SHA256:       ${sha256(STOCK_BIN)}\n`);

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
	const out = execFileSync(CANARY_BIN, ["--version"], { encoding: "utf8" }).trim();
	recordResult("C1: Canary binary version", out === "omp/18.0.11", { version: out });
}

// ─────────────────────────────────────────────────────────────────────────────
// C2: Read config without mutation
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("read");
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
}

// ─────────────────────────────────────────────────────────────────────────────
// C3: Explicit project role assignment -> project only
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("assign-project");
	const gBefore = sha256(fixture.globalConfigPath);
	const pBefore = sha256(fixture.projectConfigPath);

	// Use node script invoking the patched module directly to simulate UI explicit assignment
	const nodeScript = `
import { Settings } from "${OMP_PKG_DIR}/src/config/settings.ts";
const settings = await Settings.loadIsolated({ cwd: "${fixture.projectDir}", agentDir: "${fixture.agentDir}" });
settings.setProjectModelRole("default", "google/gemini-2.5-flash:high");
await settings.flush();
`;
	execFileSync("mise", ["exec", "--", "bun", "-e", nodeScript], { cwd: OMP_PKG_DIR });

	const gAfter = sha256(fixture.globalConfigPath);
	const pAfter = sha256(fixture.projectConfigPath);
	const pText = fs.readFileSync(fixture.projectConfigPath, "utf8");

	const passed = gBefore === gAfter && pBefore !== pAfter && pText.includes("google/gemini-2.5-flash:high");
	recordResult("C3: Explicit project assignment updates PROJECT only", passed, {
		globalHashUnchanged: gBefore === gAfter,
		projectHashChanged: pBefore !== pAfter,
		projectContainsNewModel: pText.includes("google/gemini-2.5-flash:high"),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C4: Explicit global role assignment while modelRoleStorage=project -> global only
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("assign-global");
	const gBefore = sha256(fixture.globalConfigPath);
	const pBefore = sha256(fixture.projectConfigPath);

	const nodeScript = `
import { Settings } from "${OMP_PKG_DIR}/src/config/settings.ts";
import { AgentSession } from "${OMP_PKG_DIR}/src/session/agent-session.ts";
import { SessionManager } from "${OMP_PKG_DIR}/src/session/session-manager.ts";
import { Agent } from "@oh-my-pi/pi-agent-core";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";
import { ModelRegistry } from "${OMP_PKG_DIR}/src/config/model-registry.ts";
import { AuthStorage } from "${OMP_PKG_DIR}/src/session/auth-storage.ts";
import * as path from "node:path";

const settings = await Settings.loadIsolated({ cwd: "${fixture.projectDir}", agentDir: "${fixture.agentDir}" });
const authStorage = await AuthStorage.create(path.join("${fixture.agentDir}", "auth.db"));
authStorage.setRuntimeApiKey("google", "test-google-key");
const registry = new ModelRegistry(authStorage, path.join("${fixture.agentDir}", "models.yml"));
const model = getBundledModel("google", "gemini-2.5-flash");
const session = new AgentSession({
	agent: new Agent({ initialState: { model, systemPrompt: [], tools: [], messages: [] } }),
	sessionManager: SessionManager.inMemory(),
	settings,
	modelRegistry: registry,
});
await session.setModel(model, "default", {
	persistRole: { scope: "global", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }
});
await settings.flush();
await session.dispose();
`;
	execFileSync("mise", ["exec", "--", "bun", "-e", nodeScript], { cwd: OMP_PKG_DIR });

	const gAfter = sha256(fixture.globalConfigPath);
	const pAfter = sha256(fixture.projectConfigPath);
	const gText = fs.readFileSync(fixture.globalConfigPath, "utf8");

	const passed = pBefore === pAfter && gBefore !== gAfter && gText.includes("google/gemini-2.5-flash");
	recordResult("C4: Explicit global assignment while storage=project updates GLOBAL only", passed, {
		projectHashUnchanged: pBefore === pAfter,
		globalHashChanged: gBefore !== gAfter,
		globalContainsNewModel: gText.includes("google/gemini-2.5-flash"),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C5: Value-neutral assignment -> zero file rewrite, mtime & hash preserved
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("value-neutral");
	const gBefore = sha256(fixture.globalConfigPath);
	const pBefore = sha256(fixture.projectConfigPath);
	const mtimeBefore = statMtime(fixture.projectConfigPath);

	const nodeScript = `
import { Settings } from "${OMP_PKG_DIR}/src/config/settings.ts";
const settings = await Settings.loadIsolated({ cwd: "${fixture.projectDir}", agentDir: "${fixture.agentDir}" });
// Re-assign identical value
settings.setProjectModelRole("default", "anthropic/claude-sonnet-4-5:high");
await settings.flush();
`;
	execFileSync("mise", ["exec", "--", "bun", "-e", nodeScript], { cwd: OMP_PKG_DIR });

	const gAfter = sha256(fixture.globalConfigPath);
	const pAfter = sha256(fixture.projectConfigPath);
	const mtimeAfter = statMtime(fixture.projectConfigPath);
	const pText = fs.readFileSync(fixture.projectConfigPath, "utf8");

	const passed = gBefore === gAfter && pBefore === pAfter && mtimeBefore === mtimeAfter && pText.includes("DO NOT REMOVE THIS COMMENT BLOCK");
	recordResult("C5: Value-neutral assignment preserves mtime, SHA256 & comments", passed, {
		globalHashUnchanged: gBefore === gAfter,
		projectHashUnchanged: pBefore === pAfter,
		mtimeUnchanged: mtimeBefore === mtimeAfter,
		commentsPreserved: pText.includes("DO NOT REMOVE THIS COMMENT BLOCK"),
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C6: Temporary model switch -> zero config mutation
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("temporary");
	const gBefore = sha256(fixture.globalConfigPath);
	const pBefore = sha256(fixture.projectConfigPath);

	const nodeScript = `
import { Settings } from "${OMP_PKG_DIR}/src/config/settings.ts";
import { AgentSession } from "${OMP_PKG_DIR}/src/session/agent-session.ts";
import { SessionManager } from "${OMP_PKG_DIR}/src/session/session-manager.ts";
import { Agent } from "@oh-my-pi/pi-agent-core";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";
import { ModelRegistry } from "${OMP_PKG_DIR}/src/config/model-registry.ts";
import { AuthStorage } from "${OMP_PKG_DIR}/src/session/auth-storage.ts";
import * as path from "node:path";

const settings = await Settings.loadIsolated({ cwd: "${fixture.projectDir}", agentDir: "${fixture.agentDir}" });
const authStorage = await AuthStorage.create(path.join("${fixture.agentDir}", "auth.db"));
authStorage.setRuntimeApiKey("google", "test-google-key");
const registry = new ModelRegistry(authStorage, path.join("${fixture.agentDir}", "models.yml"));
const model = getBundledModel("google", "gemini-2.5-flash");
const session = new AgentSession({
	agent: new Agent({ initialState: { model, systemPrompt: [], tools: [], messages: [] } }),
	sessionManager: SessionManager.inMemory(),
	settings,
	modelRegistry: registry,
});
await session.setModelTemporary(model);
await settings.flush();
await session.dispose();
`;
	execFileSync("mise", ["exec", "--", "bun", "-e", nodeScript], { cwd: OMP_PKG_DIR });

	const gAfter = sha256(fixture.globalConfigPath);
	const pAfter = sha256(fixture.projectConfigPath);

	const passed = gBefore === gAfter && pBefore === pAfter;
	recordResult("C6: Temporary model switch produces ZERO config mutation", passed, {
		globalHashUnchanged: gBefore === gAfter,
		projectHashUnchanged: pBefore === pAfter,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// C7: Session restart and rehydration -> zero config mutation
// ─────────────────────────────────────────────────────────────────────────────
{
	const fixture = createFixture("restart");
	const gBefore = sha256(fixture.globalConfigPath);
	const pBefore = sha256(fixture.projectConfigPath);

	const nodeScript = `
import { Settings } from "${OMP_PKG_DIR}/src/config/settings.ts";
import { createAgentSession } from "${OMP_PKG_DIR}/src/sdk.ts";
import { ModelRegistry } from "${OMP_PKG_DIR}/src/config/model-registry.ts";
import { AuthStorage } from "${OMP_PKG_DIR}/src/session/auth-storage.ts";
import * as path from "node:path";

const settings = await Settings.loadIsolated({ cwd: "${fixture.projectDir}", agentDir: "${fixture.agentDir}" });
const authStorage = await AuthStorage.create(path.join("${fixture.agentDir}", "auth.db"));
const modelRegistry = new ModelRegistry(authStorage, path.join("${fixture.agentDir}", "models.yml"));

const { session } = await createAgentSession({
	cwd: "${fixture.projectDir}",
	agentDir: "${fixture.agentDir}",
	authStorage,
	modelRegistry,
	settings,
	disableExtensionDiscovery: true,
	skills: [],
	contextFiles: [],
	promptTemplates: [],
});
await settings.flush();
await session.dispose();
`;
	execFileSync("mise", ["exec", "--", "bun", "-e", nodeScript], { cwd: OMP_PKG_DIR });

	const gAfter = sha256(fixture.globalConfigPath);
	const pAfter = sha256(fixture.projectConfigPath);

	const passed = gBefore === gAfter && pBefore === pAfter;
	recordResult("C7: Session startup & restart produces ZERO config mutation", passed, {
		globalHashUnchanged: gBefore === gAfter,
		projectHashUnchanged: pBefore === pAfter,
	});
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
