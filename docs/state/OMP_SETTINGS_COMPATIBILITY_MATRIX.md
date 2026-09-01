# OMP Settings Compatibility Matrix

**Schema**: `kad.settings-matrix/v1` · **OMP**: `18.0.11` · **Source**: `omp config list`

## appearance

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `colorBlindMode` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `composer.shape` | string | PASS_THROUGH | none | `band` | `PASS_THROUGH` | OMP default acceptable |
| `display.cacheMissMarker` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `display.collapseCompacted` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `display.hideToolActivity` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `display.shimmer` | classic|kitt|disabled | PASS_THROUGH | none | `classic` | `PASS_THROUGH` | OMP default acceptable |
| `display.showTokenUsage` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `display.showTurnTime` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `display.smoothStreaming` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `images.autoResize` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `images.blockImages` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `showHardwareCursor` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.compactThinkingLevel` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.contextLine` | off|percentage|annotated|embedded | PASS_THROUGH | none | `embedded` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.preset` | default|minimal|compact|full|nerd|ascii|custom | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.separator` | powerline|powerline-thin|slash|pipe|block|none|ascii | PASS_THROUGH | none | `powerline-thin` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.sessionAccent` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.showHookStatus` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.transparent` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `symbolPreset` | unicode|nerd|ascii | PASS_THROUGH | none | `unicode` | `PASS_THROUGH` | OMP default acceptable |
| `task.showResolvedModelBadge` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `terminal.showImages` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `terminal.showProgress` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `theme.dark` | string | PASS_THROUGH | none | `obsidian` | `PASS_THROUGH` | OMP default acceptable |
| `theme.light` | string | PASS_THROUGH | none | `light` | `PASS_THROUGH` | OMP default acceptable |
| `tui.codexResetFireworks` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tui.hyperlinks` | off|auto|always | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `tui.imeSafeCursor` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tui.renderMermaid` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `tui.resizeScrollback` | append|rebuild|preserve | PASS_THROUGH | none | `rebuild` | `PASS_THROUGH` | OMP default acceptable |
| `tui.textSizing` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tui.tight` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tui.titleState` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |

## context

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `branchSummary.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `compaction.asyncEnabled` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.dropUseless` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.enabled` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.handoffSaveToDisk` | boolean | KAD_WRAPPED | none | `false` | `false` | KAD project-scoped policy |
| `compaction.idleEnabled` | boolean | KAD_WRAPPED | none | `false` | `false` | KAD project-scoped policy |
| `compaction.idleThresholdTokens` | number | KAD_WRAPPED | none | `200000` | `200000` | KAD project-scoped policy |
| `compaction.idleTimeoutSeconds` | number | KAD_WRAPPED | none | `300` | `300` | KAD project-scoped policy |
| `compaction.methodOrder` | array | KAD_WRAPPED | none | `["snapcompact"]` | `["snapcompact"]` | KAD project-scoped policy |
| `compaction.midTurnEnabled` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.remoteStreamingV2Enabled` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.supersedeReads` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.thresholdPercent` | number | KAD_WRAPPED | none | `70` | `70` | KAD project-scoped policy |
| `compaction.thresholdTokens` | number | KAD_WRAPPED | none | `-1` | `-1` | KAD project-scoped policy |
| `contextPromotion.enabled` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `extendedContext` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `snapcompact.shape` | auto|8x8r-bw|8x8r-sent|8x8u-bw|8x8u-sent|6x6u-bw|6x6u-sent|5x8-bw|5x8-sent|6x12-dim|8x13-bw|8on16-bw|8on22-bw|11on16-bw|silver16-bw|doc-8on16-bw|doc-8on16-sent|doc-8on16-sent-dim | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `snapcompact.systemPrompt` | none|agents-md|all | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `snapcompact.toolResults` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tools.format` | auto|native|glm|hermes|kimi|xml|anthropic|deepseek|harmony|qwen3|gemini|gemma|minimax | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `ttsr.builtinRules` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `ttsr.contextMode` | discard|keep | KAD_RESTRICTED | none | `discard` | `discard` | KAD project-scoped policy |
| `ttsr.disabledRules` | array | KAD_RESTRICTED | none | `[]` | `[]` | KAD project-scoped policy |
| `ttsr.enabled` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `ttsr.interruptMode` | never|prose-only|tool-only|always | KAD_RESTRICTED | none | `always` | `always` | KAD project-scoped policy |
| `ttsr.repeatGap` | number | KAD_RESTRICTED | none | `10` | `10` | KAD project-scoped policy |
| `ttsr.repeatMode` | once|after-gap | KAD_RESTRICTED | none | `once` | `once` | KAD project-scoped policy |
| `workspace.additionalDirectories` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |

## files

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `edit.autoRepair.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `edit.blackbox.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `edit.blockAutoGenerated` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `edit.enforceSeenLines` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `edit.fuzzyMatch` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `edit.fuzzyThreshold` | number | PASS_THROUGH | none | `0.95` | `PASS_THROUGH` | OMP default acceptable |
| `edit.mode` | apply_patch|hashline|patch|replace|sloppy | PASS_THROUGH | none | `hashline` | `PASS_THROUGH` | OMP default acceptable |
| `edit.streamingAbort` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.diagnosticsDeduplicate` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.diagnosticsOnEdit` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.diagnosticsOnWrite` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.formatOnWrite` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.lazy` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `lsp.shared` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `read.defaultLimit` | number | PASS_THROUGH | none | `300` | `PASS_THROUGH` | OMP default acceptable |
| `read.renderMarkdown` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.minBodyLines` | number | PASS_THROUGH | none | `4` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.minCommentLines` | number | PASS_THROUGH | none | `6` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.minTotalLines` | number | PASS_THROUGH | none | `100` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.prose` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.unfoldLimit` | number | PASS_THROUGH | none | `100` | `PASS_THROUGH` | OMP default acceptable |
| `read.summarize.unfoldUntil` | number | PASS_THROUGH | none | `50` | `PASS_THROUGH` | OMP default acceptable |
| `read.toolResultPreview` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `readLineNumbers` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |

## interaction

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `ask.notify` | on|off | PASS_THROUGH | none | `on` | `PASS_THROUGH` | OMP default acceptable |
| `ask.timeout` | number | PASS_THROUGH | none | `0` | `PASS_THROUGH` | OMP default acceptable |
| `autoResume` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `autocompleteMaxVisible` | number | PASS_THROUGH | none | `10` | `PASS_THROUGH` | OMP default acceptable |
| `collab.displayName` | string | REQUIRES_HUMAN_POLICY | none | `` | `` | KAD project-scoped policy |
| `collab.relayUrl` | string | REQUIRES_HUMAN_POLICY | none | `wss://my.omp.sh` | `wss://my.omp.sh` | KAD project-scoped policy |
| `collab.webUrl` | string | REQUIRES_HUMAN_POLICY | none | `` | `` | KAD project-scoped policy |
| `completion.notify` | on|off | PASS_THROUGH | none | `on` | `PASS_THROUGH` | OMP default acceptable |
| `doubleEscapeAction` | branch|tree|none | PASS_THROUGH | none | `tree` | `PASS_THROUGH` | OMP default acceptable |
| `emojiAutocomplete` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `error.notify` | on|off | PASS_THROUGH | none | `off` | `PASS_THROUGH` | OMP default acceptable |
| `features.unexpectedStopDetection` | none|mechanical|smart | PASS_THROUGH | none | `mechanical` | `PASS_THROUGH` | OMP default acceptable |
| `followUpMode` | all|one-at-a-time | PASS_THROUGH | none | `one-at-a-time` | `PASS_THROUGH` | OMP default acceptable |
| `git.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `interruptMode` | immediate|wait | PASS_THROUGH | none | `immediate` | `PASS_THROUGH` | OMP default acceptable |
| `loop.mode` | prompt|compact|reset | PASS_THROUGH | none | `prompt` | `PASS_THROUGH` | OMP default acceptable |
| `magicKeywords.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `magicKeywords.orchestrate` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `magicKeywords.ultrathink` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `magicKeywords.workflow` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `marketplace.autoUpdate` | off|notify|auto | PASS_THROUGH | none | `notify` | `PASS_THROUGH` | OMP default acceptable |
| `paste.largeMenuThreshold` | number | PASS_THROUGH | none | `100` | `PASS_THROUGH` | OMP default acceptable |
| `power.sleepPrevention` | off|idle|display|system | PASS_THROUGH | none | `idle` | `PASS_THROUGH` | OMP default acceptable |
| `recap.enabled` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `recap.idleSeconds` | number | KAD_RESTRICTED | none | `240` | `240` | KAD project-scoped policy |
| `share.redactSecrets` | boolean | REQUIRES_HUMAN_POLICY | none | `true` | `true` | KAD project-scoped policy |
| `share.serverUrl` | string | REQUIRES_HUMAN_POLICY | none | `https://my.omp.sh/s` | `https://my.omp.sh/s` | KAD project-scoped policy |
| `share.store` | blob|gist | REQUIRES_HUMAN_POLICY | none | `blob` | `blob` | KAD project-scoped policy |
| `spelling.autocomplete` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `spelling.autocorrect` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `spelling.typoDetection` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `startup.changelogMode` | summary|expanded|hidden | PASS_THROUGH | none | `summary` | `PASS_THROUGH` | OMP default acceptable |
| `startup.checkUpdate` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `startup.quiet` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `startup.setupWizard` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `startup.showSplash` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `steeringMode` | all|one-at-a-time | PASS_THROUGH | none | `one-at-a-time` | `PASS_THROUGH` | OMP default acceptable |
| `stt.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `stt.modelName` | fast|balanced|turbo|parakeet | PASS_THROUGH | none | `parakeet` | `PASS_THROUGH` | OMP default acceptable |
| `stt.submitTrigger` | never|release|release-complete|say-submit | PASS_THROUGH | none | `never` | `PASS_THROUGH` | OMP default acceptable |
| `tools.approval` | record | REQUIRES_HUMAN_POLICY | none | `{}` | `{}` | KAD project-scoped policy |
| `tools.approvalMode` | always-ask|write|yolo | REQUIRES_HUMAN_POLICY | none | `yolo` | `yolo` | KAD project-scoped policy |
| `treeFilterMode` | default|no-tools|user-only|labeled-only|all | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `update.channel` | stable|canary | PASS_THROUGH | none | `stable` | `PASS_THROUGH` | OMP default acceptable |

## internal

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `async.maxJobs` | number | PASS_THROUGH | none | `100` | `PASS_THROUGH` | OMP default acceptable |
| `auth.broker.token` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `auth.broker.url` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `autolearn.minToolCalls` | number | PASS_THROUGH | none | `5` | `PASS_THROUGH` | OMP default acceptable |
| `bash.autoBackground.thresholdMs` | number | PASS_THROUGH | none | `60000` | `PASS_THROUGH` | OMP default acceptable |
| `bashInterceptor.patterns` | array | PASS_THROUGH | none | `[{"pattern":"^\\s*(cat|head|tail|less|more)\\s+","tool":"read","message":"Use the `read` tool instead of cat/head/tail. It provides better context and handles binary files."},{"pattern":"^\\s*(grep|rg|ripgrep|ag|ack)\\s+","tool":"grep","message":"Use the `grep` tool instead of grep/rg. It respects .gitignore and provides structured output."},{"pattern":"^\\s*(find|fd|locate)\\s+.*(-name|-iname|-type|--type|-glob)","tool":"glob","message":"Use the `glob` tool instead of find/fd. It respects .gitignore and is faster for glob patterns."},{"pattern":"^\\s*sed\\s+(-i|--in-place)","tool":"edit","message":"Use the `edit` tool instead of sed -i. It provides diff preview and fuzzy matching."},{"pattern":"^\\s*perl\\s+.*-[pn]?i","tool":"edit","message":"Use the `edit` tool instead of perl -i. It provides diff preview and fuzzy matching."},{"pattern":"^\\s*awk\\s+.*-i\\s+inplace","tool":"edit","message":"Use the `edit` tool instead of awk -i inplace. It provides diff preview and fuzzy matching."},{"pattern":"^\\s*(echo|printf|cat\\s*<<)\\s+(?:(?:[^\"'>]|\"[^\"]*\"|'[^']*')|(?<!\\|)>{1,2}\\|?\\s*(?:\"/dev/(?:null|tty|stdout|stderr)\"|'/dev/(?:null|tty|stdout|stderr)'|/dev/(?:null|tty|stdout|stderr))(?:[\\s;&|]|$))*(?<!\\|)>{1,2}\\|?\\s*(?!(?:\"/dev/(?:null|tty|stdout|stderr)\"|'/dev/(?:null|tty|stdout|stderr)'|/dev/(?:null|tty|stdout|stderr))(?:[\\s;&|]|$))[$\\w./~\"'-]","tool":"write","message":"Use the `write` tool instead of echo/cat redirection. It handles encoding and provides confirmation."},{"pattern":"^\\s*nohup\\s+|(?<!&)\\&\\s*$","tool":"hub","message":"Use the `hub` tool (`op:\"start\"`) instead of nohup or background shell syntax so the process stays observable and managed."},{"pattern":"^\\s*(?:(?:bun|npm|pnpm|yarn)\\s+(?:run\\s+)?(?:dev|start)(?:\\s|$)|(?:vite|next\\s+dev|nuxt\\s+dev|nodemon|lldb|gdb|tail\\s+-f)(?:\\s|$)|docker\\s+compose\\s+up(?!.*(?:\\s-d(?:\\s|$)|--detach))(?:\\s|$))","tool":"hub","message":"Use the `hub` tool (`op:\"start\"`) for services, watchers, and debuggers so other omp instances can observe and control them."},{"pattern":"^\\s*(?:(?:bun|npm|pnpm|yarn)\\s+(?:run\\s+)?\\S+|cargo\\s+watch|watchexec|pytest|vitest|jest|tsc)(?:.|\\n)*(?:--watch|-w)(?:\\s|$)","tool":"hub","message":"Use the `hub` tool (`op:\"start\"`) for watch mode so its output, input, and lifecycle stay managed."}]` | `PASS_THROUGH` | OMP default acceptable |
| `branchSummary.reserveTokens` | number | PASS_THROUGH | none | `16384` | `PASS_THROUGH` | OMP default acceptable |
| `commit.cacheEnabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `commit.cacheTtlDays` | number | PASS_THROUGH | none | `14` | `PASS_THROUGH` | OMP default acceptable |
| `commit.changelogMaxDiffChars` | number | PASS_THROUGH | none | `120000` | `PASS_THROUGH` | OMP default acceptable |
| `commit.mapBatchTokenBudget` | number | PASS_THROUGH | none | `16000` | `PASS_THROUGH` | OMP default acceptable |
| `commit.mapReduceEnabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `commit.mapReduceThreshold` | number | PASS_THROUGH | none | `5000` | `PASS_THROUGH` | OMP default acceptable |
| `compaction.autoContinue` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `compaction.keepRecentTokens` | number | KAD_WRAPPED | none | `20000` | `20000` | KAD project-scoped policy |
| `compaction.remoteEndpoint` | string | KAD_WRAPPED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `compaction.reserveTokens` | number | KAD_WRAPPED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `compaction.v2RetainedMessageBudget` | number | KAD_WRAPPED | none | `64000` | `64000` | KAD project-scoped policy |
| `cycleOrder` | array | KAD_WRAPPED | none | `["smol","default","slow"]` | `["smol","default","slow"]` | KAD project-scoped policy |
| `dev.autoqaConsent` | unset|granted|denied | REQUIRES_HUMAN_POLICY | none | `unset` | `unset` | KAD project-scoped policy |
| `dev.autoqaPush.token` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `disabledExtensions` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `disabledProviders` | array | KAD_RESTRICTED | none | `["openrouter"]` | `["openrouter"]` | KAD project-scoped policy |
| `enabledModels` | array | KAD_DEFAULT | none | `["kad-local-world/*","kad-local-qwen/qwen-local"]` | `["kad-local-world/*","kad-local-qwen/qwen-local"]` | KAD project-scoped policy |
| `eval.autoBackground.thresholdMs` | number | PASS_THROUGH | none | `60000` | `PASS_THROUGH` | OMP default acceptable |
| `extensions` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `gc.archive` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `gc.blobs` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `gc.coldArchiveAfterDays` | number | PASS_THROUGH | none | `30` | `PASS_THROUGH` | OMP default acceptable |
| `gc.retainNewestGlobal` | number | PASS_THROUGH | none | `20` | `PASS_THROUGH` | OMP default acceptable |
| `gc.retainNewestPerCwd` | number | PASS_THROUGH | none | `10` | `PASS_THROUGH` | OMP default acceptable |
| `gc.wal` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `hindsight.bankIdPrefix` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `hindsight.bankMission` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `hindsight.debug` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `hindsight.mentalModelMaxRenderChars` | number | KAD_RESTRICTED | none | `16000` | `16000` | KAD project-scoped policy |
| `hindsight.mentalModelRefreshIntervalMs` | number | KAD_RESTRICTED | none | `300000` | `300000` | KAD project-scoped policy |
| `hindsight.recallBudget` | low|mid|high | KAD_RESTRICTED | none | `mid` | `mid` | KAD project-scoped policy |
| `hindsight.recallContextTurns` | number | KAD_RESTRICTED | none | `1` | `1` | KAD project-scoped policy |
| `hindsight.recallMaxQueryChars` | number | KAD_RESTRICTED | none | `800` | `800` | KAD project-scoped policy |
| `hindsight.recallMaxTokens` | number | KAD_RESTRICTED | none | `1024` | `1024` | KAD project-scoped policy |
| `hindsight.recallTimeoutMs` | number | KAD_RESTRICTED | none | `30000` | `30000` | KAD project-scoped policy |
| `hindsight.recallTypes` | array | KAD_RESTRICTED | none | `["world","experience"]` | `["world","experience"]` | KAD project-scoped policy |
| `hindsight.reflectTimeoutMs` | number | KAD_RESTRICTED | none | `120000` | `120000` | KAD project-scoped policy |
| `hindsight.requestTimeoutMs` | number | KAD_RESTRICTED | none | `30000` | `30000` | KAD project-scoped policy |
| `hindsight.retainContext` | string | KAD_RESTRICTED | none | `omp` | `omp` | KAD project-scoped policy |
| `hindsight.retainEveryNTurns` | number | KAD_RESTRICTED | none | `3` | `3` | KAD project-scoped policy |
| `hindsight.retainMission` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `hindsight.retainOverlapTurns` | number | KAD_RESTRICTED | none | `2` | `2` | KAD project-scoped policy |
| `hindsight.retainTimeoutMs` | number | KAD_RESTRICTED | none | `60000` | `60000` | KAD project-scoped policy |
| `images.urls.credentials` | record | NOT_APPLICABLE | none | `********` | `********` | KAD project-scoped policy |
| `images.urls.options` | record | NOT_APPLICABLE | none | `{}` | `{}` | KAD project-scoped policy |
| `inspect_image.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `memories.enabled` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `memories.fallbackTokenLimit` | number | KAD_RESTRICTED | none | `16000` | `16000` | KAD project-scoped policy |
| `memories.maxRawMemoriesForGlobal` | number | KAD_RESTRICTED | none | `200` | `200` | KAD project-scoped policy |
| `memories.maxRolloutAgeDays` | number | KAD_RESTRICTED | none | `30` | `30` | KAD project-scoped policy |
| `memories.maxRolloutsPerStartup` | number | KAD_RESTRICTED | none | `64` | `64` | KAD project-scoped policy |
| `memories.minRolloutIdleHours` | number | KAD_RESTRICTED | none | `12` | `12` | KAD project-scoped policy |
| `memories.phase1InputTokenLimit` | number | KAD_RESTRICTED | none | `4000` | `4000` | KAD project-scoped policy |
| `memories.phase2HeartbeatSeconds` | number | KAD_RESTRICTED | none | `30` | `30` | KAD project-scoped policy |
| `memories.phase2LeaseSeconds` | number | KAD_RESTRICTED | none | `180` | `180` | KAD project-scoped policy |
| `memories.phase2RetryDelaySeconds` | number | KAD_RESTRICTED | none | `180` | `180` | KAD project-scoped policy |
| `memories.rolloutPayloadPercent` | number | KAD_RESTRICTED | none | `0.7` | `0.7` | KAD project-scoped policy |
| `memories.stage1Concurrency` | number | KAD_RESTRICTED | none | `8` | `8` | KAD project-scoped policy |
| `memories.stage1LeaseSeconds` | number | KAD_RESTRICTED | none | `120` | `120` | KAD project-scoped policy |
| `memories.stage1RetryDelaySeconds` | number | KAD_RESTRICTED | none | `120` | `120` | KAD project-scoped policy |
| `memories.summaryInjectionTokenLimit` | number | KAD_RESTRICTED | none | `5000` | `5000` | KAD project-scoped policy |
| `memories.threadScanLimit` | number | KAD_RESTRICTED | none | `300` | `300` | KAD project-scoped policy |
| `mnemopi.debug` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `mnemopi.injectionTokenLimit` | number | KAD_RESTRICTED | none | `5000` | `5000` | KAD project-scoped policy |
| `mnemopi.recallContextTurns` | number | KAD_RESTRICTED | none | `3` | `3` | KAD project-scoped policy |
| `mnemopi.recallLimit` | number | KAD_RESTRICTED | none | `8` | `8` | KAD project-scoped policy |
| `mnemopi.recallMaxQueryChars` | number | KAD_RESTRICTED | none | `4000` | `4000` | KAD project-scoped policy |
| `mnemopi.retainEveryNTurns` | number | KAD_RESTRICTED | none | `4` | `4` | KAD project-scoped policy |
| `modelProviderOrder` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `modelRoles` | record | KAD_DEFAULT | default conflict | `{"advisor":"google-antigravity/gemini-3-flash:low","plan":"openai-codex/gpt-5.6-luna:high","slow":"google-antigravity/gemini-3-flash:high","task":"openai-codex/gpt-5.4-mini:low","smol":"zai-free/glm-4.7-flash:minimal","tiny":"zai-free/glm-4.7-flash:minimal","commit":"zai-free/glm-4.7-flash:low","designer":"google-antigravity/gemini-3-flash:high","vision":"google-antigravity/gemini-3-flash:high","oracle":"openai-codex/gpt-5.6-luna:max","verifier":"google-antigravity/gemini-3-flash:high","research":"google-antigravity/gemini-3-flash:medium","world":"kad-local-world/kad-local-s13:low","local_retrieval":"kad-local-qwen/qwen-local:low"}` | `{"default":null,"plan":"openai-codex/gpt-5.6-luna:high","slow":"google-antigravity/gemini-3-flash:high","advisor":"google-antigravity/gemini-3-flash:low","task":"openai-codex/gpt-5.4-mini:low","smol":"zai-free/glm-4.7-flash:minimal","tiny":"zai-free/glm-4.7-flash:minimal","commit":"zai-free/glm-4.7-flash:low","designer":"google-antigravity/gemini-3-flash:high","vision":"google-antigravity/gemini-3-flash:high","oracle":"openai-codex/gpt-5.6-luna:max","verifier":"google-antigravity/gemini-3-flash:high","research":"google-antigravity/gemini-3-flash:medium","world":"kad-local-world/kad-local-s13:low","local_retrieval":"kad-local-qwen/qwen-local:low"}` | KAD project-scoped policy |
| `modelTags` | record | KAD_DEFAULT | none | `{"oracle":{"name":"Oracle (manual premium escalation)","hidden":true},"verifier":{"name":"Verifier (independent provider-family review)"},"research":{"name":"Research (literature and technical synthesis)"},"world":{"name":"World (Stheno WORLD-only)"},"local_retrieval":{"name":"Local Retrieval (Qwen retrieval-only)"},"local_general":{"name":"Local General (unqualified)","hidden":true}}` | `{"oracle":{"name":"Oracle (manual premium escalation)","hidden":true},"verifier":{"name":"Verifier (independent provider-family review)"},"research":{"name":"Research (literature and technical synthesis)"},"world":{"name":"World (Stheno WORLD-only)"},"local_retrieval":{"name":"Local Retrieval (Qwen retrieval-only)"},"local_general":{"name":"Local General (unqualified)","hidden":true}}` | KAD project-scoped policy |
| `retry.baseDelayMs` | number | KAD_WRAPPED | none | `500` | `500` | KAD project-scoped policy |
| `retry.enabled` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `searxng.basicPassword` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.basicUsername` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.categories` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.engines` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.language` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.safesearch` | number | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `searxng.token` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `setupVersion` | number | PASS_THROUGH | none | `2` | `PASS_THROUGH` | OMP default acceptable |
| `sharpshooter.injectionTokenLimit` | number | KAD_RESTRICTED | none | `15000` | `15000` | KAD project-scoped policy |
| `sharpshooter.intervalMinutes` | number | KAD_RESTRICTED | none | `5` | `5` | KAD project-scoped policy |
| `shellMinimizer.except` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.legacyFilters` | boolean | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.maxCaptureBytes` | number | PASS_THROUGH | none | `4194304` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.only` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.settingsPath` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `shellPath` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `skills.customDirectories` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enableAgentsProject` | boolean | KAD_DEFAULT | none | `true` | `true` | KAD project-scoped policy |
| `skills.enableAgentsUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enableClaudeProject` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enableClaudeUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enableCodexUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enablePiProject` | boolean | KAD_DEFAULT | none | `false` | `false` | KAD project-scoped policy |
| `skills.enablePiUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enabled` | boolean | KAD_DEFAULT | none | `true` | `true` | KAD project-scoped policy |
| `skills.ignoredSkills` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `skills.includeSkills` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.leftSegments` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.rightSegments` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `statusLine.segmentOptions` | record | PASS_THROUGH | none | `{}` | `PASS_THROUGH` | OMP default acceptable |
| `stt.language` | string | PASS_THROUGH | none | `en` | `PASS_THROUGH` | OMP default acceptable |
| `task.agentAdvisor` | record | KAD_WRAPPED | none | `{"kad-master":"off","kad-builder":"off","kad-tester":"off","kad-reviewer":"off","kad-researcher":"off","kad-local-world":"off","kad-local-extractor":"off","scout":"off","sonic":"off","designer":"off","reviewer":"off","security-reviewer":"off","librarian":"off"}` | `{"kad-master":"off","kad-builder":"off","kad-tester":"off","kad-reviewer":"off","kad-researcher":"off","kad-local-world":"off","kad-local-extractor":"off","scout":"off","sonic":"off","designer":"off","reviewer":"off","security-reviewer":"off","librarian":"off"}` | KAD project-scoped policy |
| `task.agentModelOverrides` | record | KAD_WRAPPED | none | `{"kad-master":"@plan","kad-builder":"@task","kad-tester":"@verifier","kad-reviewer":"@verifier","kad-researcher":"@research","kad-local-world":"@world","kad-local-extractor":"@local_retrieval","scout":"@smol","sonic":"@tiny","designer":"@designer","reviewer":"@verifier","security-reviewer":"@verifier","librarian":"@research"}` | `{"kad-master":"@plan","kad-builder":"@task","kad-tester":"@verifier","kad-reviewer":"@verifier","kad-researcher":"@research","kad-local-world":"@world","kad-local-extractor":"@local_retrieval","scout":"@smol","sonic":"@tiny","designer":"@designer","reviewer":"@verifier","security-reviewer":"@verifier","librarian":"@research"}` | KAD project-scoped policy |
| `task.agentPrewalk` | record | PASS_THROUGH | none | `{}` | `PASS_THROUGH` | OMP default acceptable |
| `task.disabledAgents` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.high` | number | PASS_THROUGH | none | `16384` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.low` | number | PASS_THROUGH | none | `2048` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.max` | number | PASS_THROUGH | none | `32768` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.medium` | number | PASS_THROUGH | none | `8192` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.minimal` | number | PASS_THROUGH | none | `1024` | `PASS_THROUGH` | OMP default acceptable |
| `thinkingBudgets.xhigh` | number | PASS_THROUGH | none | `32768` | `PASS_THROUGH` | OMP default acceptable |
| `tui.maxInlineImageColumns` | number | PASS_THROUGH | none | `100` | `PASS_THROUGH` | OMP default acceptable |
| `tui.maxInlineImageRows` | number | PASS_THROUGH | none | `20` | `PASS_THROUGH` | OMP default acceptable |
| `tui.maxInlineImages` | number | PASS_THROUGH | none | `8` | `PASS_THROUGH` | OMP default acceptable |

## memory

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `autolearn.autoContinue` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `autolearn.enabled` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `hindsight.apiToken` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `hindsight.apiUrl` | string | KAD_RESTRICTED | none | `http://localhost:8888` | `http://localhost:8888` | KAD project-scoped policy |
| `hindsight.autoRecall` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `hindsight.autoRetain` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `hindsight.bankId` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `hindsight.mentalModelAutoSeed` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `hindsight.mentalModelsEnabled` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `hindsight.retainMode` | full-session|last-turn | KAD_RESTRICTED | none | `full-session` | `full-session` | KAD project-scoped policy |
| `hindsight.scoping` | global|per-project|per-project-tagged | KAD_RESTRICTED | none | `per-project-tagged` | `per-project-tagged` | KAD project-scoped policy |
| `memory.backend` | off|local|hindsight|mnemopi|sharpshooter | KAD_RESTRICTED | none | `off` | `off` | KAD project-scoped policy |
| `mnemopi.autoRecall` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `mnemopi.autoRetain` | boolean | KAD_RESTRICTED | none | `true` | `true` | KAD project-scoped policy |
| `mnemopi.bank` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.dbPath` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.embeddingApiKey` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.embeddingApiUrl` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.embeddingModel` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.embeddingVariant` | en|multilingual | KAD_RESTRICTED | none | `en` | `en` | KAD project-scoped policy |
| `mnemopi.enhancedRecall` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `mnemopi.llmApiKey` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.llmBaseUrl` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.llmMode` | none|smol|remote | KAD_RESTRICTED | none | `smol` | `smol` | KAD project-scoped policy |
| `mnemopi.llmModel` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `mnemopi.noEmbeddings` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `mnemopi.polyphonicRecall` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `mnemopi.proactiveLinking` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `mnemopi.scoping` | global|per-project|per-project-tagged | KAD_RESTRICTED | none | `per-project` | `per-project` | KAD project-scoped policy |
| `providers.memoryModel` | online|qwen3-1.7b|llama3.2:3b|gemma-3-1b|qwen2.5-1.5b|lfm2-1.2b | PASS_THROUGH | none | `online` | `PASS_THROUGH` | OMP default acceptable |
| `sharpshooter.model` | string | KAD_RESTRICTED | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |

## model

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `advisor.enabled` | boolean | KAD_RESTRICTED | none | `false` | `false` | KAD project-scoped policy |
| `advisor.immuneTurns` | number | PASS_THROUGH | none | `3` | `PASS_THROUGH` | OMP default acceptable |
| `advisor.syncBacklog` | off|1|3|5 | PASS_THROUGH | none | `off` | `PASS_THROUGH` | OMP default acceptable |
| `defaultThinkingLevel` | minimal|low|medium|high|xhigh|max|auto | PASS_THROUGH | none | `high` | `PASS_THROUGH` | OMP default acceptable |
| `externalThinking` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `hideThinkingBlock` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `images.describeForTextModels` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `images.urls.backends` | array | NOT_APPLICABLE | none | `["provider-files","tailscale","cloudflared","litterbox"]` | `["provider-files","tailscale","cloudflared","litterbox"]` | KAD project-scoped policy |
| `images.urls.bindHost` | string | NOT_APPLICABLE | none | `127.0.0.1` | `127.0.0.1` | KAD project-scoped policy |
| `images.urls.command` | string | NOT_APPLICABLE | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `images.urls.enabled` | boolean | NOT_APPLICABLE | none | `false` | `false` | KAD project-scoped policy |
| `images.urls.publicBaseUrl` | string | NOT_APPLICABLE | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `images.urls.sshRemotePort` | number | NOT_APPLICABLE | none | `8787` | `8787` | KAD project-scoped policy |
| `images.urls.sshTarget` | string | NOT_APPLICABLE | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `images.urls.ttlHours` | number | NOT_APPLICABLE | none | `72` | `72` | KAD project-scoped policy |
| `includeModelInPrompt` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `includeWorkspaceTree` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `inlineToolDescriptors` | auto|on|off | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `minP` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `model.loopGuard.checkAssistantContent` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `model.loopGuard.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `model.loopGuard.toolCallReminder` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `model.toolCallLoopGuard.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `model.toolCallLoopGuard.exemptTools` | array | PASS_THROUGH | none | `["hub"]` | `PASS_THROUGH` | OMP default acceptable |
| `model.toolCallLoopGuard.threshold` | number | PASS_THROUGH | none | `5` | `PASS_THROUGH` | OMP default acceptable |
| `modelRoleStorage` | global|project | KAD_DEFAULT | none | `project` | `project` | KAD project-scoped policy |
| `omitThinking` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `personality` | default|friendly|pragmatic|none | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `presencePenalty` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `prewalk.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `proseOnlyThinking` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `providers.anthropic.serverSideFallback` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `providers.autoThinkingMaxEffort` | xhigh|max | PASS_THROUGH | none | `xhigh` | `PASS_THROUGH` | OMP default acceptable |
| `providers.autoThinkingModel` | online|qwen3-1.7b|llama3.2:3b|gemma-3-1b|qwen2.5-1.5b|lfm2-1.2b | PASS_THROUGH | none | `online` | `PASS_THROUGH` | OMP default acceptable |
| `repetitionPenalty` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `retry.fallbackChains` | record | KAD_WRAPPED | none | `{"default":["google-antigravity/gemini-3-flash:medium"],"plan":["google-antigravity/gemini-3-flash:high"],"slow":["openai-codex/gpt-5.6-luna:high"],"advisor":["openai-codex/gpt-5.4-mini:low"],"task":["zai-free/glm-4.7-flash:low"],"smol":["openai-codex/gpt-5.4-mini:minimal"],"tiny":["openai-codex/gpt-5.4-mini:minimal"],"commit":["openai-codex/gpt-5.4-mini:low"],"designer":["openai-codex/gpt-5.6-luna:high"],"vision":["openai-codex/gpt-5.6-luna:high"],"verifier":["openai-codex/gpt-5.6-luna:high"],"research":["openai-codex/gpt-5.4-mini:low"],"oracle":[],"world":[],"local_retrieval":[],"local_general":[]}` | `{"default":["google-antigravity/gemini-3-flash:medium"],"plan":["google-antigravity/gemini-3-flash:high"],"slow":["openai-codex/gpt-5.6-luna:high"],"advisor":["openai-codex/gpt-5.4-mini:low"],"task":["zai-free/glm-4.7-flash:low"],"smol":["openai-codex/gpt-5.4-mini:minimal"],"tiny":["openai-codex/gpt-5.4-mini:minimal"],"commit":["openai-codex/gpt-5.4-mini:low"],"designer":["openai-codex/gpt-5.6-luna:high"],"vision":["openai-codex/gpt-5.6-luna:high"],"verifier":["openai-codex/gpt-5.6-luna:high"],"research":["openai-codex/gpt-5.4-mini:low"],"oracle":[],"world":[],"local_retrieval":[],"local_general":[]}` | KAD project-scoped policy |
| `retry.fallbackRevertPolicy` | cooldown-expiry|never | KAD_WRAPPED | none | `cooldown-expiry` | `cooldown-expiry` | KAD project-scoped policy |
| `retry.maxDelayMs` | number | KAD_WRAPPED | none | `300000` | `300000` | KAD project-scoped policy |
| `retry.maxRetries` | number | KAD_WRAPPED | none | `10` | `10` | KAD project-scoped policy |
| `retry.modelFallback` | boolean | KAD_WRAPPED | none | `true` | `true` | KAD project-scoped policy |
| `retry.usageAwareFallback` | boolean | KAD_WRAPPED | none | `false` | `false` | KAD project-scoped policy |
| `retry.usageReservePct` | number | KAD_WRAPPED | none | `10` | `10` | KAD project-scoped policy |
| `retry.usageReservePolicy` | confirm|auto|fail-closed | KAD_WRAPPED | none | `confirm` | `confirm` | KAD project-scoped policy |
| `temperature` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `textVerbosity` | low|medium|high | PASS_THROUGH | none | `medium` | `PASS_THROUGH` | OMP default acceptable |
| `tier.advisor` | inherit|none|auto|default|flex|scale|priority | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `tier.anthropic` | none|priority | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `tier.google` | none|flex|priority | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `tier.openai` | none|auto|default|flex|scale|priority | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `tier.subagent` | inherit|none|auto|default|flex|scale|priority | PASS_THROUGH | none | `inherit` | `PASS_THROUGH` | OMP default acceptable |
| `topK` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `topP` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |

## providers

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `codexResets.autoRedeem` | unset|yes|no | NOT_APPLICABLE | none | `unset` | `unset` | KAD project-scoped policy |
| `codexResets.keepCredits` | number | NOT_APPLICABLE | none | `0` | `0` | KAD project-scoped policy |
| `codexResets.minBlockedMinutes` | number | NOT_APPLICABLE | none | `60` | `60` | KAD project-scoped policy |
| `codexResets.salvageHorizonHours` | number | NOT_APPLICABLE | none | `12` | `12` | KAD project-scoped policy |
| `exa.enabled` | boolean | NOT_APPLICABLE | none | `true` | `true` | KAD project-scoped policy |
| `exa.searchDelayMs` | number | NOT_APPLICABLE | none | `1000` | `1000` | KAD project-scoped policy |
| `live.voice` | arbor|breeze|cove|ember|juniper|maple|sol|spruce|vale | NOT_APPLICABLE | none | `sol` | `sol` | KAD project-scoped policy |
| `provider.appendOnlyContext` | auto|on|off | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.antigravityEndpoint` | auto|production|sandbox | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.cacheRetention` | auto|short|long|none | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.fetch` | auto|native|trafilatura|lynx|parallel|jina | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.fireworksTier` | standard|priority | PASS_THROUGH | none | `standard` | `PASS_THROUGH` | OMP default acceptable |
| `providers.imageOrder` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `providers.kimiApiFormat` | auto|openai|anthropic | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.maxInFlightRequests` | record | PASS_THROUGH | none | `{}` | `PASS_THROUGH` | OMP default acceptable |
| `providers.openaiWebsockets` | auto|off|on | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.openrouterVariant` | default|nitro|floor|online|exacto | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `providers.streamFirstEventTimeoutSeconds` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `providers.streamIdleTimeoutSeconds` | number | PASS_THROUGH | none | `-1` | `PASS_THROUGH` | OMP default acceptable |
| `providers.tinyModel` | online|lfm2-350m|qwen3-0.6b|gemma-270m|qwen2.5-0.5b|lfm2-700m | PASS_THROUGH | none | `online` | `PASS_THROUGH` | OMP default acceptable |
| `providers.tinyModelDevice` | default|gpu|cpu|metal|webgpu|cuda|dml|coreml|auto|wasm|webnn|webnn-gpu|webnn-cpu|webnn-npu | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `providers.tinyModelDtype` | default|q4|q4f16|q8|fp16|fp32|int8|uint8|bnb4|q2|q2f16|q1|q1f16|auto | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `providers.tts` | auto|local|xai|deepinfra | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `providers.unexpectedStopModel` | online|qwen3-1.7b|llama3.2:3b|gemma-3-1b|qwen2.5-1.5b|lfm2-1.2b | PASS_THROUGH | none | `online` | `PASS_THROUGH` | OMP default acceptable |
| `providers.webSearchExclude` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `providers.webSearchGeminiModel` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `providers.webSearchOrder` | array | PASS_THROUGH | none | `["gemini","perplexity","anthropic","codex","xai","zai","exa","tinyfish","jina","kagi","tavily","firecrawl","brave","kimi","parallel","synthetic","searxng","startpage","duckduckgo","ecosia","google","mojeek","public"]` | `PASS_THROUGH` | OMP default acceptable |
| `providers.webSearchTimeoutSeconds` | number | PASS_THROUGH | none | `60` | `PASS_THROUGH` | OMP default acceptable |
| `searxng.endpoint` | string | REQUIRES_HUMAN_POLICY | none | `UNKNOWN` | `UNKNOWN` | KAD project-scoped policy |
| `secrets.enabled` | boolean | REQUIRES_HUMAN_POLICY | none | `true` | `true` | KAD project-scoped policy |
| `speech.enabled` | boolean | NOT_APPLICABLE | none | `false` | `false` | KAD project-scoped policy |
| `speech.enhanced` | boolean | NOT_APPLICABLE | none | `false` | `false` | KAD project-scoped policy |
| `speech.mode` | all|assistant|yield | NOT_APPLICABLE | none | `assistant` | `assistant` | KAD project-scoped policy |
| `speech.voice` | af_heart|af_bella|af_nicole|af_aoede|af_kore|af_sarah|am_michael|am_fenrir|am_puck|bf_emma|bm_george|bm_fable | NOT_APPLICABLE | none | `af_heart` | `af_heart` | KAD project-scoped policy |
| `tts.localModel` | kokoro | NOT_APPLICABLE | none | `kokoro` | `kokoro` | KAD project-scoped policy |
| `tts.localVoice` | af_heart|af_bella|af_nicole|af_aoede|af_kore|af_sarah|am_michael|am_fenrir|am_puck|bf_emma|bm_george|bm_fable | NOT_APPLICABLE | none | `af_heart` | `af_heart` | KAD project-scoped policy |

## shell

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `bash.autoBackground.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `bash.direnv` | auto|off | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `bash.direnvLoadTimeoutMs` | number | PASS_THROUGH | none | `30000` | `PASS_THROUGH` | OMP default acceptable |
| `bash.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `bash.patterns` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `bashInterceptor.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `eval.autoBackground.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `eval.jl` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `eval.js` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `eval.py` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `eval.rb` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `julia.interpreter` | string | PASS_THROUGH | none | `` | `PASS_THROUGH` | OMP default acceptable |
| `python.interpreter` | string | PASS_THROUGH | none | `` | `PASS_THROUGH` | OMP default acceptable |
| `python.kernelMode` | session|per-call | PASS_THROUGH | none | `session` | `PASS_THROUGH` | OMP default acceptable |
| `ruby.interpreter` | string | PASS_THROUGH | none | `` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `shellMinimizer.sourceOutlineLevel` | default|aggressive | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |

## tasks

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `commands.enableClaudeProject` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `commands.enableClaudeUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `commands.enableOpencodeProject` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `commands.enableOpencodeUser` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `goal.continuationModes` | array | PASS_THROUGH | none | `["interactive"]` | `PASS_THROUGH` | OMP default acceptable |
| `goal.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `goal.statusInFooter` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `plan.defaultOnStartup` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `plan.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `skills.enableSkillCommands` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `task.agentIdleTtlMs` | number | PASS_THROUGH | none | `420000` | `PASS_THROUGH` | OMP default acceptable |
| `task.batch` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `task.eager` | default|preferred|always | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `task.enableEffort` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `task.enableLsp` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `task.isolation.apply` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `task.isolation.commits` | generic|ai | PASS_THROUGH | none | `generic` | `PASS_THROUGH` | OMP default acceptable |
| `task.isolation.merge` | patch|branch | PASS_THROUGH | none | `patch` | `PASS_THROUGH` | OMP default acceptable |
| `task.isolation.mode` | none|auto|apfs|btrfs|zfs|reflink|overlayfs|projfs|block-clone|rcopy | PASS_THROUGH | none | `none` | `PASS_THROUGH` | OMP default acceptable |
| `task.maxConcurrency` | number | PASS_THROUGH | none | `32` | `PASS_THROUGH` | OMP default acceptable |
| `task.maxEffort` | minimal|low|medium|high|xhigh|max | PASS_THROUGH | none | `max` | `PASS_THROUGH` | OMP default acceptable |
| `task.maxRecursionDepth` | number | PASS_THROUGH | none | `2` | `PASS_THROUGH` | OMP default acceptable |
| `task.maxRuntimeMs` | number | PASS_THROUGH | none | `0` | `PASS_THROUGH` | OMP default acceptable |
| `task.prewalk` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `task.softRequestBudget` | number | PASS_THROUGH | none | `200` | `PASS_THROUGH` | OMP default acceptable |
| `task.softRequestBudgetNotice` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `title.refreshOnReplan` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `worktree.base` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |

## tools

| Setting | Type | Policy | Deviation | Current | Expected | Rationale |
|---|---|---|---|---|---|---|
| `ask.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `astEdit.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `astGrep.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `async.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `async.pollWaitDuration` | 5s|10s|30s|1m|5m|smart | PASS_THROUGH | none | `smart` | `PASS_THROUGH` | OMP default acceptable |
| `browser.cdpUrl` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `browser.cmux` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `browser.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `browser.headless` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `browser.relay` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `browser.relayUrl` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `browser.screenshotDir` | string | PASS_THROUGH | none | `UNKNOWN` | `PASS_THROUGH` | OMP default acceptable |
| `checkpoint.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `computer.display` | string | PASS_THROUGH | none | `all` | `PASS_THROUGH` | OMP default acceptable |
| `computer.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `computer.maxHeight` | number | PASS_THROUGH | none | `2400` | `PASS_THROUGH` | OMP default acceptable |
| `computer.maxWidth` | number | PASS_THROUGH | none | `3840` | `PASS_THROUGH` | OMP default acceptable |
| `debug.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `dev.autoqa` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `dev.autoqaPush.endpoint` | string | PASS_THROUGH | none | `https://qa.omp.sh/v1/grievances` | `PASS_THROUGH` | OMP default acceptable |
| `extensionHandlers.toolCallTimeoutMs` | number | PASS_THROUGH | none | `30000` | `PASS_THROUGH` | OMP default acceptable |
| `fetch.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `generate_image.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `github.cache.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `github.cache.hardTtlSec` | number | PASS_THROUGH | none | `604800` | `PASS_THROUGH` | OMP default acceptable |
| `github.cache.softTtlSec` | number | PASS_THROUGH | none | `300` | `PASS_THROUGH` | OMP default acceptable |
| `github.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `glob.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `grep.contextAfter` | number | PASS_THROUGH | none | `3` | `PASS_THROUGH` | OMP default acceptable |
| `grep.contextBefore` | number | PASS_THROUGH | none | `1` | `PASS_THROUGH` | OMP default acceptable |
| `grep.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `inspect_image.mode` | auto|on|off | PASS_THROUGH | none | `auto` | `PASS_THROUGH` | OMP default acceptable |
| `inspect_image.timeoutMs` | number | PASS_THROUGH | none | `300000` | `PASS_THROUGH` | OMP default acceptable |
| `irc.timeoutMs` | number | PASS_THROUGH | none | `120000` | `PASS_THROUGH` | OMP default acceptable |
| `launch.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `mcp.enableProjectConfig` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `mcp.notificationDebounceMs` | number | PASS_THROUGH | none | `500` | `PASS_THROUGH` | OMP default acceptable |
| `mcp.notifications` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `mcp.renderMarkdownResults` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `security.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `speechgen.enabled` | boolean | PASS_THROUGH | none | `false` | `PASS_THROUGH` | OMP default acceptable |
| `tasks.todoClearDelay` | number | PASS_THROUGH | none | `60` | `PASS_THROUGH` | OMP default acceptable |
| `todo.eager` | default|preferred|always | PASS_THROUGH | none | `default` | `PASS_THROUGH` | OMP default acceptable |
| `todo.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `todo.reminders` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `todo.remindersMax` | number | PASS_THROUGH | none | `3` | `PASS_THROUGH` | OMP default acceptable |
| `tools.abortOnFabricatedResult` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `tools.artifactHeadBytes` | number | PASS_THROUGH | none | `20` | `PASS_THROUGH` | OMP default acceptable |
| `tools.artifactSpillThreshold` | number | PASS_THROUGH | none | `50` | `PASS_THROUGH` | OMP default acceptable |
| `tools.artifactTailBytes` | number | PASS_THROUGH | none | `20` | `PASS_THROUGH` | OMP default acceptable |
| `tools.artifactTailLines` | number | PASS_THROUGH | none | `500` | `PASS_THROUGH` | OMP default acceptable |
| `tools.intentTracing` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `tools.maxTimeout` | number | PASS_THROUGH | none | `0` | `PASS_THROUGH` | OMP default acceptable |
| `tools.outputMaxColumns` | number | PASS_THROUGH | none | `768` | `PASS_THROUGH` | OMP default acceptable |
| `tools.xdev` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `tools.xdevDocs` | inline|builtins|catalog | PASS_THROUGH | none | `builtins` | `PASS_THROUGH` | OMP default acceptable |
| `tools.xdevInlineDevices` | array | PASS_THROUGH | none | `[]` | `PASS_THROUGH` | OMP default acceptable |
| `vault.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
| `web_search.enabled` | boolean | PASS_THROUGH | none | `true` | `PASS_THROUGH` | OMP default acceptable |
