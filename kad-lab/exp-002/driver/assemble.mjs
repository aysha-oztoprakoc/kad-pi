// KAD-WP-002 — driver: assemble.mjs
// - load frozen context, frozen corpus, frozen interpreter prompt;
// - produce the stable user message per the frozen template;
// - NO label information reaches the MODEL UNDER TEST;
// - stable rendering of context.json == its exact frozen bytes.

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");

/** Read frozen control files. */
export function loadFrozen() {
  const corpus = JSON.parse(readFileSync(path.join(ROOT, "corpus.json"), "utf8"));
  const context = JSON.parse(readFileSync(path.join(ROOT, "context.json"), "utf8"));
  const promptText = readFileSync(path.join(ROOT, "interpreter-prompt.txt"), "utf8");
  return { corpus, context, promptText };
}

/** Stable JSON rendering of context.json == its exact frozen bytes. */
export function stableContextRendering() {
  return readFileSync(path.join(ROOT, "context.json"), "utf8").trimEnd();
}

/**
 * Build the frozen user message for one raw input.
 * Template (frozen):
 *   InterpretationContext (read-only, non-authoritative):
 *   <stable JSON rendering of context.json>
 *
 *   RawInput:
 *   "<raw>"
 *
 *   Return only the CandidateIntent JSON object.
 */
export function buildUserMessage(raw, contextRendering) {
  const escaped = String(raw).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return [
    "InterpretationContext (read-only, non-authoritative):",
    contextRendering,
    "",
    "RawInput:",
    '"' + escaped + '"',
    "",
    "Return only the CandidateIntent JSON object.",
  ].join("\n");
}

/** Extract the frozen SYSTEM prompt section from interpreter-prompt.txt. */
export function frozenSystemPrompt(promptText) {
  const start = promptText.indexOf("## SYSTEM PROMPT (exact, frozen)");
  const section = promptText.slice(start);
  const body = section.split("\n").slice(1).join("\n").trim();
  return body;
}

/** Produce the full frozen request set for all 17 primary inputs (labels NEVER included). */
export function assembleAll() {
  const { corpus, context, promptText } = loadFrozen();
  const rendering = stableContextRendering();
  const system = frozenSystemPrompt(promptText);
  return corpus.map((item) => ({
    input_id: item.id,
    raw: item.raw,
    system,
    user: buildUserMessage(item.raw, rendering),
    context_id: context.context_id,
  }));
}

// CLI entry: node assemble.mjs [R01]  -> print the assembled request JSON for one/all inputs.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const requests = assembleAll();
  const want = process.argv[2];
  const picked = want ? requests.filter((r) => r.input_id === want) : requests;
  console.log(JSON.stringify(picked, null, 2));
}
