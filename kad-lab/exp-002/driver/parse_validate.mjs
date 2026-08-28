// KAD-WP-002 — driver: transport-only parser + real-WP-001 validation bridge.
// - apply the transport-only parser (never repair output);
// - convert parsed CandidateIntent to the CLI line protocol;
// - execute the C++ CLI (real Validator, then Resolver only after acceptance);
// - preserve the actual ValidationResult;
// - append one immutable attempt record per InterpretationAttempt.

import { readFileSync, appendFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");
export const CLI = path.join(ROOT, "build", "kad_validator_cli");

export const TRANSPORT_VERSION = "exp002-transport-v1";
export const INTERPRETER_VERSION = "exp002-interpreter-v1";

/** Strict transport-only parser. Returns
 *  { parse_status: "parsed", candidate } | { parse_status: "TRANSPORT_MALFORMED", reason }
 */
export function parseModelOutput(rawText) {
  if (typeof rawText !== "string") return { parse_status: "TRANSPORT_MALFORMED", reason: "invalid_json" };
  const trimmed = rawText.trim();
  if (trimmed.length === 0) return { parse_status: "TRANSPORT_MALFORMED", reason: "empty" };
  let value;
  try {
    value = JSON.parse(trimmed);
  } catch {
    // NO fence stripping, NO substring extraction, NO repair, NO retry, NO second model.
    return { parse_status: "TRANSPORT_MALFORMED", reason: "invalid_json" };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { parse_status: "TRANSPORT_MALFORMED", reason: "not_object" };
  }
  const keys = Object.keys(value).sort();
  const required = ["actions", "properties"].sort();
  if (keys.length !== 2 || keys[0] !== required[0] || keys[1] !== required[1]) {
    return { parse_status: "TRANSPORT_MALFORMED", reason: "unexpected_top_level" };
  }
  const { actions, properties } = value;
  if (!Array.isArray(actions)) return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
  for (const action of actions) {
    if (typeof action !== "object" || action === null || Array.isArray(action)) {
      return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
    }
    const akeys = Object.keys(action).sort();
    if (akeys.length !== 2 || akeys[0] !== "targets" || akeys[1] !== "verb") {
      return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
    }
    if (action.verb !== null && typeof action.verb !== "string") {
      return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
    }
    if (!Array.isArray(action.targets) || !action.targets.every((t) => typeof t === "string")) {
      return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
    }
  }
  if (!Array.isArray(properties)) return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
  for (const prop of properties) {
    if (!Array.isArray(prop) || prop.length !== 2 ||
        typeof prop[0] !== "string" || typeof prop[1] !== "string") {
      return { parse_status: "TRANSPORT_MALFORMED", reason: "wrong_types" };
    }
  }
  return { parse_status: "parsed", candidate: { actions, properties } };
}

/** Freeze the C0 context state tokens (player_room / key_room / crate_room) from context.json. */
export function readContextState() {
  const ctx = JSON.parse(readFileSync(path.join(ROOT, "context.json"), "utf8"));
  return {
    playerRoom: ctx.world_state.player_room,
    keyRoom: ctx.world_state.key_room,
    crateRoom: ctx.world_state.crate_room,
  };
}

/** Deterministic CLI line protocol. verb null -> flag 1 with blank verb line. */
export function toLineProtocol(candidate, state) {
  const lines = [state.playerRoom, state.keyRoom, state.crateRoom, String(candidate.actions.length)];
  for (const action of candidate.actions) {
    if (action.verb === null) {
      lines.push("1", "", String(action.targets.length));
    } else {
      lines.push("0", String(action.verb), String(action.targets.length));
    }
    for (const target of action.targets) lines.push(String(target));
  }
  lines.push(String(candidate.properties.length));
  for (const [k, v] of candidate.properties) lines.push(String(k), String(v));
  return lines.join("\n") + "\n";
}

/** Run the REAL C++ Validator/Resolver adapter. Returns parsed JSON. */
export function runValidatorCli(candidate, state) {
  const input = toLineProtocol(candidate, state);
  const res = spawnSync(CLI, [], { input, encoding: "utf8" });
  if (res.error) throw new Error("CLI spawn failed: " + res.error.message);
  const text = (res.stdout || "").trim();
  const last = text.split("\n").filter(Boolean).pop() || "";
  let parsed;
  try {
    parsed = JSON.parse(last);
  } catch {
    throw new Error("CLI produced unparseable output: " + text.slice(0, 300));
  }
  return parsed;
}

/** One immutable InterpretationAttempt record (see PROVENANCE CONTRACT). */
export function buildAttempt({ attemptId, inputId, phase, attemptIndex, rawModelOutput, reasoningText, usage, finish, resolvedRoute }) {
  const base = {
    experiment_id: "KAD-EXPERIMENT-002",
    attempt_id: attemptId,
    raw_input_id: inputId,
    phase,
    attempt_index: attemptIndex,
    context_id: "C0",
    requested_provider: "opencode-go",
    requested_model: "deepseek-v4-pro",
    resolved_provider: resolvedRoute?.provider ?? null,
    resolved_model: resolvedRoute?.model ?? null,
    system_prompt_version: INTERPRETER_VERSION,
    interpreter_prompt_version: INTERPRETER_VERSION,
    candidate_transport_version: TRANSPORT_VERSION,
    generation_config_hash: readGenerationConfigHash(),
    raw_model_output: rawModelOutput,
    reasoning_text: reasoningText ?? null,
    usage: usage ?? null,
    finish: finish ?? null,
  };
  const parsed = parseModelOutput(rawModelOutput);
  let record = { ...base, parse_status: parsed.parse_status };
  if (parsed.parse_status === "TRANSPORT_MALFORMED") {
    record.transport_malformed_reason = parsed.reason;
    record.parsed_candidate_intent = null;
    record.validation_result = null;
    record.resolution = null;
  } else {
    const candidate = parsed.candidate;
    record.parsed_candidate_intent = candidate;
    // EVERY parsed CandidateIntent goes to the unchanged C++ Validator (including actions == []).
    const state = readContextState();
    let vres;
    try {
      vres = runValidatorCli(candidate, state);
    } catch (e) {
      record.validation_result = { kind: "cli_error", error: String(e.message) };
      record.resolution = null;
      return record;
    }
    if (vres.status === "rejected") {
      record.validation_result = { kind: "rejected", failure: vres.failure };
      record.resolution = null; // Resolver NOT invoked.
    } else if (vres.status === "accepted") {
      record.validation_result = { kind: "accepted", action: vres.action, target: vres.target };
      record.resolution = vres; // real Resolution from the C++ Resolver.
    } else {
      record.validation_result = { kind: "cli_error", error: vres.error ?? "unknown" };
      record.resolution = null;
    }
  }
  return record;
}

function readGenerationConfigHash() {
  try {
    const hashes = JSON.parse(readFileSync(path.join(ROOT, "controls", "control-hashes.json"), "utf8"));
    return hashes.files?.["controls/generation-config.json"] ?? null;
  } catch {
    return null;
  }
}

/** Append immutable JSONL lines. */
export function appendAttempts(records) {
  const file = path.join(ROOT, "attempts", "attempts.jsonl");
  if (!existsSync(file)) writeFileSync(file, "", "utf8");
  appendFileSync(file, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
}

/** Self-test: run the deterministic parser fixtures. Interpreter-side verification only. */
export function selfTestParserFixtures() {
  const fixtures = JSON.parse(readFileSync(path.join(ROOT, "fixtures", "parser-fixtures.json"), "utf8"));
  const results = [];
  for (const fx of fixtures.fixtures) {
    const got = parseModelOutput(fx.raw);
    let ok = got.parse_status === fx.expected.parse_status;
    if (ok && fx.expected.parse_status === "parsed") {
      ok = JSON.stringify(got.candidate) === JSON.stringify(fx.expected.candidate);
    }
    if (ok && fx.expected.reason) ok = got.reason === fx.expected.reason;
    results.push({ id: fx.id, ok, got });
  }
  return results;
}

export function selfTestCliFixtures() {
  // Parse fixtures/cli-fixtures.txt CASE blocks (regex-anchored at line start; the
  // file header mentions CASE in prose and must not spawn a bogus block).
  const text = readFileSync(path.join(ROOT, "fixtures", "cli-fixtures.txt"), "utf8");
  const results = [];
  const state = readContextState();
  const re = /^CASE (.+)$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    const blockStart = m.index + m[0].length;
    const next = re.lastIndex === text.length ? text.length : (() => { const m2 = /^CASE /gm; m2.lastIndex = re.lastIndex; const n = m2.exec(text); return n ? n.index : text.length; })();
    const body = text.slice(blockStart, next);
    const lines = body.split("\n").map((l) => l.trim());
    const inIdx = lines.indexOf("INPUT");
    const endIdx = lines.indexOf("INPUT_END");
    if (inIdx === -1 || endIdx === -1) continue; // not a machine block
    const input = lines.slice(inIdx + 1, endIdx).join("\n");
    const expects = lines.slice(endIdx + 1).filter((l) => l.startsWith("EXPECT ")).map((l) => l.slice("EXPECT ".length));
    const res = spawnSync(CLI, [], { input: input + "\n", encoding: "utf8" });
    const out = (res.stdout || "").trim().split("\n").filter(Boolean).pop() || "";
    results.push({ name, ok: expects.every((e) => out.includes(e)), output: out });
  }
  return results;
}
