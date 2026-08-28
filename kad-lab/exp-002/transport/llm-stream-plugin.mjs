// KAD-WP-002 — TEMPORARY Cordis transport glue (EXPERIMENT INFRASTRUCTURE ONLY)
// Transcription of the authoritative transport-plugin scope (rev 2):
//   inject llm; register ONE temporary Builder-facing tool 'exp002_stream';
//   call ONLY ctx.llm.stream({provider:"opencode-go", model:"deepseek-v4-pro",
//   system, messages:[{role:"user",content:user}], temperature:0, maxTokens:512});
//   pass NO tools field; do NOT parse CandidateIntent; do NOT call game code;
//   do NOT write files. Session-scoped, reversible via Cordis stop/undefine.
// NOTE: this deployment (dsh web profile, 'code' agent preset) does NOT compose
// the model-facing cordis toolset (dsh-tool-cordis), and dynamic-package
// 'define' never crosses the wire, so this plugin cannot be mounted in the
// running session as of this build; it is shipped as the frozen seam contract.

export const name = "kad-wp002-llm-stream";
export const inject = ["llm"];

export function apply(ctx) {
  ctx.tools.register("exp002_stream", {
    description:
      "EXPERIMENTAL KAD-WP-002 transport tool: ONE direct ctx.llm.stream() " +
      "request to provider opencode-go, model deepseek-v4-pro, with NO tools " +
      "field. Returns raw text deltas, reasoning deltas, usage, and finish " +
      "metadata verbatim. Input: { system: string, user: string }.",
    input: {
      type: "object",
      properties: {
        system: { type: "string", description: "frozen interpreter system prompt" },
        user: { type: "string", description: "assembled user message (context + RawInput)" }
      },
      required: ["system", "user"]
    },
    async execute(input) {
      if (typeof input?.system !== "string" || typeof input?.user !== "string") {
        throw new Error("exp002_stream: expected { system: string, user: string }");
      }
      let rawText = "";
      let reasoningText = "";
      let usage = null;
      let finishKind = null;
      let finishErrorCode = null;
      const stream = ctx.llm.stream({
        provider: "opencode-go",
        model: "deepseek-v4-pro",
        system: input.system,
        messages: [{ role: "user", content: input.user }],
        temperature: 0,
        maxTokens: 512
        // NO tools field: the model under test receives zero tools.
      });
      for await (const chunk of stream) {
        switch (chunk.type) {
          case "text-delta":
            rawText += chunk.text;
            break;
          case "reasoning-delta":
            reasoningText += chunk.text;
            break;
          case "usage":
            usage = chunk.usage;
            break;
          case "finish":
            finishKind = chunk.kind;
            finishErrorCode = chunk.failure?.code ?? null;
            break;
          default:
            break;
        }
      }
      return {
        rawText,
        reasoningText,
        usage,
        finishKind,
        finishErrorCode
      };
    }
  });
}
