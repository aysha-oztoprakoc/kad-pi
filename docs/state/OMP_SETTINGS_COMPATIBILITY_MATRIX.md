# OMP Settings Compatibility Matrix

**Schema**: `kad.settings-matrix/v1` · **OMP**: 18.0.11 · **Source revision**: `b8ce33a58911c26bed1d84f0db9a5e2e727c49a2`

Rendered by `make models-sync` from `docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.json` — edit the JSON, not this file.

**Baseline.** These rows describe the OMP 18.0.11 surface at source revision b8ce33a58911c26bed1d84f0db9a5e2e727c49a2. Settings introduced after that revision have no row and are therefore unclassified — `retry.waitForUsageReset` is the live example, and it now decides the launcher profiles (ADR 0019 amendment). Rows whose key `.omp/config.yml` declares are re-synced from the running harness; the rest are the capture as reported.

**Observed runtime**: 18.1.18 on 2026-09-12.

**Re-capture.** Run `make models-sync` after any project-declared setting changes. A full re-capture against a newer OMP build means re-deriving `settings` from that build's `omp config list --json` and settings schema, re-classifying every row, and updating `omp_version` and `source_revision` — it is a review, not a sync.

## `advisor.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| advisor.enabled | false | false | KAD_RESTRICTED | PASS | PASS |
| advisor.syncBacklog | "off" | "off" | PASS_THROUGH | N/A | N/A |
| advisor.immuneTurns | 3 | 3 | PASS_THROUGH | N/A | N/A |

## `ask.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| ask.timeout | 0 | 0 | PASS_THROUGH | N/A | N/A |
| ask.notify | "on" | "on" | PASS_THROUGH | N/A | N/A |
| ask.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `astEdit.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| astEdit.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `astGrep.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| astGrep.enabled | false | true | PASS_THROUGH | N/A | N/A |

## `async.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| async.enabled | true | true | PASS_THROUGH | N/A | N/A |
| async.maxJobs | 100 | 100 | PASS_THROUGH | N/A | N/A |
| async.pollWaitDuration | "smart" | "smart" | PASS_THROUGH | N/A | N/A |

## `auth.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| auth.broker.url | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| auth.broker.token | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `autocompleteMaxVisible`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| autocompleteMaxVisible | 10 | 10 | PASS_THROUGH | N/A | N/A |

## `autolearn.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| autolearn.enabled | false | true | REQUIRES_HUMAN_POLICY | PASS | N/A |
| autolearn.autoContinue | false | false | KAD_RESTRICTED | PASS | PASS |
| autolearn.minToolCalls | 5 | 5 | PASS_THROUGH | N/A | N/A |

## `autoResume`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| autoResume | false | false | PASS_THROUGH | N/A | N/A |

## `bash.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| bash.enabled | true | true | PASS_THROUGH | N/A | N/A |
| bash.autoBackground.enabled | true | true | PASS_THROUGH | N/A | N/A |
| bash.patterns | [] | [] | PASS_THROUGH | N/A | N/A |
| bash.direnv | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| bash.direnvLoadTimeoutMs | 30000 | 30000 | PASS_THROUGH | N/A | N/A |
| bash.autoBackground.thresholdMs | 60000 | 60000 | PASS_THROUGH | N/A | N/A |

## `bashInterceptor.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| bashInterceptor.enabled | false | false | PASS_THROUGH | N/A | N/A |
| bashInterceptor.patterns | "[non-empty object array: 5 bas… | [{"pattern":"^\\s*(cat\|head\|tai… | PASS_THROUGH | N/A | N/A |

## `branchSummary.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| branchSummary.enabled | false | false | PASS_THROUGH | N/A | N/A |
| branchSummary.reserveTokens | 16384 | 16384 | PASS_THROUGH | N/A | N/A |

## `browser.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| browser.enabled | true | true | PASS_THROUGH | N/A | N/A |
| browser.cdpUrl | null | null | PASS_THROUGH | N/A | N/A |
| browser.relay | false | false | PASS_THROUGH | N/A | N/A |
| browser.relayUrl | null | null | PASS_THROUGH | N/A | N/A |
| browser.headless | true | true | PASS_THROUGH | N/A | N/A |
| browser.cmux | true | true | PASS_THROUGH | N/A | N/A |
| browser.screenshotDir | null | null | PASS_THROUGH | N/A | N/A |

## `checkpoint.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| checkpoint.enabled | false | true | PASS_THROUGH | N/A | N/A |

## `codexResets.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| codexResets.autoRedeem | "unset" | "unset" | NOT_APPLICABLE | N/A | N/A |
| codexResets.minBlockedMinutes | 60 | 60 | NOT_APPLICABLE | N/A | N/A |
| codexResets.keepCredits | 0 | 0 | NOT_APPLICABLE | N/A | N/A |
| codexResets.salvageHorizonHours | 12 | 12 | NOT_APPLICABLE | N/A | N/A |

## `collab.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| collab.relayUrl | "wss://my.omp.sh" | "wss://my.omp.sh" | REQUIRES_HUMAN_POLICY | N/A | N/A |
| collab.webUrl | "" | "" | REQUIRES_HUMAN_POLICY | N/A | N/A |
| collab.displayName | "" | "" | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `colorBlindMode`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| colorBlindMode | false | false | PASS_THROUGH | N/A | N/A |

## `commands.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| commands.enableClaudeUser | true | true | PASS_THROUGH | N/A | N/A |
| commands.enableClaudeProject | true | true | PASS_THROUGH | N/A | N/A |
| commands.enableOpencodeUser | true | true | PASS_THROUGH | N/A | N/A |
| commands.enableOpencodeProject | true | true | PASS_THROUGH | N/A | N/A |

## `commit.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| commit.mapReduceEnabled | true | true | PASS_THROUGH | N/A | N/A |
| commit.mapReduceThreshold | 5000 | 5000 | PASS_THROUGH | N/A | N/A |
| commit.mapBatchTokenBudget | 16000 | 16000 | PASS_THROUGH | N/A | N/A |
| commit.cacheEnabled | true | true | PASS_THROUGH | N/A | N/A |
| commit.cacheTtlDays | 14 | 14 | PASS_THROUGH | N/A | N/A |
| commit.changelogMaxDiffChars | 120000 | 120000 | PASS_THROUGH | N/A | N/A |

## `compaction.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| compaction.enabled | true | true | KAD_WRAPPED | PASS | PASS |
| compaction.midTurnEnabled | true | true | KAD_WRAPPED | N/A | N/A |
| compaction.methodOrder | ["snapcompact"] | ["snapcompact","handoff","shake… | KAD_WRAPPED | N/A | N/A |
| compaction.thresholdPercent | -1 | 70 | KAD_WRAPPED | N/A | N/A |
| compaction.thresholdTokens | -1 | -1 | KAD_WRAPPED | N/A | N/A |
| compaction.handoffSaveToDisk | false | false | KAD_WRAPPED | N/A | N/A |
| compaction.remoteStreamingV2Enabled | true | true | KAD_WRAPPED | N/A | N/A |
| compaction.asyncEnabled | true | true | KAD_WRAPPED | N/A | N/A |
| compaction.reserveTokens | null | null | KAD_WRAPPED | N/A | N/A |
| compaction.keepRecentTokens | 20000 | 20000 | KAD_WRAPPED | N/A | N/A |
| compaction.autoContinue | true | true | KAD_WRAPPED | N/A | N/A |
| compaction.remoteEndpoint | null | null | KAD_WRAPPED | N/A | N/A |
| compaction.v2RetainedMessageBudget | 64000 | 64000 | KAD_WRAPPED | N/A | N/A |
| compaction.idleEnabled | false | false | KAD_WRAPPED | N/A | N/A |
| compaction.idleThresholdTokens | 200000 | 200000 | KAD_WRAPPED | N/A | N/A |
| compaction.idleTimeoutSeconds | 300 | 300 | KAD_WRAPPED | N/A | N/A |
| compaction.supersedeReads | true | true | KAD_WRAPPED | N/A | N/A |
| compaction.dropUseless | true | true | KAD_WRAPPED | N/A | N/A |

## `completion.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| completion.notify | "on" | "on" | PASS_THROUGH | N/A | N/A |

## `composer.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| composer.shape | "band" | "band" | PASS_THROUGH | N/A | N/A |

## `computer.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| computer.enabled | false | true | PASS_THROUGH | N/A | N/A |
| computer.display | "all" | "all" | PASS_THROUGH | N/A | N/A |
| computer.maxWidth | 3840 | 3840 | PASS_THROUGH | N/A | N/A |
| computer.maxHeight | 2400 | 2400 | PASS_THROUGH | N/A | N/A |

## `contextPromotion.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| contextPromotion.enabled | false | false | KAD_RESTRICTED | PASS | PASS |

## `cycleOrder`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| cycleOrder | ["smol","default","slow"] | ["default","plan","slow","smol"… | KAD_WRAPPED | N/A | N/A |

## `debug.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| debug.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `defaultThinkingLevel`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| defaultThinkingLevel | "high" | "high" | PASS_THROUGH | N/A | N/A |

## `dev.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| dev.autoqa | true | true | PASS_THROUGH | N/A | N/A |
| dev.autoqaPush.endpoint | "https://qa.omp.sh/v1/grievance… | "https://qa.omp.sh/v1/grievance… | PASS_THROUGH | N/A | N/A |
| dev.autoqaPush.token | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| dev.autoqaConsent | "unset" | "unset" | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `disabledExtensions`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| disabledExtensions | [] | [] | PASS_THROUGH | N/A | N/A |

## `disabledProviders`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| disabledProviders | [] | ["openrouter"] | KAD_RESTRICTED | FAIL | PASS |

## `display.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| display.shimmer | "classic" | "classic" | PASS_THROUGH | N/A | N/A |
| display.smoothStreaming | true | true | PASS_THROUGH | N/A | N/A |
| display.hideToolActivity | false | false | PASS_THROUGH | N/A | N/A |
| display.showTokenUsage | false | false | PASS_THROUGH | N/A | N/A |
| display.showTurnTime | false | false | PASS_THROUGH | N/A | N/A |
| display.cacheMissMarker | false | false | PASS_THROUGH | N/A | N/A |
| display.collapseCompacted | true | true | PASS_THROUGH | N/A | N/A |

## `doubleEscapeAction`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| doubleEscapeAction | "tree" | "tree" | PASS_THROUGH | N/A | N/A |

## `edit.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| edit.mode | "hashline" | "hashline" | PASS_THROUGH | N/A | N/A |
| edit.fuzzyMatch | true | true | PASS_THROUGH | N/A | N/A |
| edit.fuzzyThreshold | 0.95 | 0.95 | PASS_THROUGH | N/A | N/A |
| edit.streamingAbort | false | false | PASS_THROUGH | N/A | N/A |
| edit.blockAutoGenerated | true | true | PASS_THROUGH | N/A | N/A |
| edit.enforceSeenLines | false | false | PASS_THROUGH | N/A | N/A |
| edit.blackbox.enabled | false | false | PASS_THROUGH | N/A | N/A |
| edit.autoRepair.enabled | false | false | PASS_THROUGH | N/A | N/A |

## `emojiAutocomplete`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| emojiAutocomplete | true | true | PASS_THROUGH | N/A | N/A |

## `enabledModels`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| enabledModels | [] | ["google-antigravity/*","openai… | KAD_DEFAULT | N/A | N/A |

## `error.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| error.notify | "off" | "off" | PASS_THROUGH | N/A | N/A |

## `eval.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| eval.py | true | true | PASS_THROUGH | N/A | N/A |
| eval.js | true | true | PASS_THROUGH | N/A | N/A |
| eval.rb | false | false | PASS_THROUGH | N/A | N/A |
| eval.jl | false | false | PASS_THROUGH | N/A | N/A |
| eval.autoBackground.enabled | false | false | PASS_THROUGH | N/A | N/A |
| eval.autoBackground.thresholdMs | 60000 | 60000 | PASS_THROUGH | N/A | N/A |

## `exa.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| exa.enabled | true | true | NOT_APPLICABLE | N/A | N/A |
| exa.searchDelayMs | 1000 | 1000 | NOT_APPLICABLE | N/A | N/A |

## `extendedContext`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| extendedContext | false | true | PASS_THROUGH | N/A | N/A |

## `extensionHandlers.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| extensionHandlers.toolCallTimeoutMs | 30000 | 30000 | PASS_THROUGH | N/A | N/A |

## `extensions`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| extensions | [] | [] | PASS_THROUGH | N/A | N/A |

## `externalThinking`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| externalThinking | false | false | PASS_THROUGH | N/A | N/A |

## `features.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| features.unexpectedStopDetection | "mechanical" | "mechanical" | PASS_THROUGH | N/A | N/A |

## `fetch.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| fetch.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `followUpMode`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| followUpMode | "one-at-a-time" | "one-at-a-time" | PASS_THROUGH | N/A | N/A |

## `gc.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| gc.blobs | true | true | PASS_THROUGH | N/A | N/A |
| gc.archive | true | true | PASS_THROUGH | N/A | N/A |
| gc.wal | true | true | PASS_THROUGH | N/A | N/A |
| gc.coldArchiveAfterDays | 30 | 30 | PASS_THROUGH | N/A | N/A |
| gc.retainNewestGlobal | 20 | 20 | PASS_THROUGH | N/A | N/A |
| gc.retainNewestPerCwd | 10 | 10 | PASS_THROUGH | N/A | N/A |

## `generate_image.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| generate_image.enabled | false | false | PASS_THROUGH | N/A | N/A |

## `git.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| git.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `github.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| github.enabled | false | true | PASS_THROUGH | N/A | N/A |
| github.cache.enabled | true | true | PASS_THROUGH | N/A | N/A |
| github.cache.softTtlSec | 300 | 300 | PASS_THROUGH | N/A | N/A |
| github.cache.hardTtlSec | 604800 | 604800 | PASS_THROUGH | N/A | N/A |

## `glob.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| glob.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `goal.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| goal.enabled | true | true | PASS_THROUGH | N/A | N/A |
| goal.statusInFooter | true | true | PASS_THROUGH | N/A | N/A |
| goal.continuationModes | ["interactive"] | ["interactive"] | PASS_THROUGH | N/A | N/A |

## `grep.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| grep.enabled | true | true | PASS_THROUGH | N/A | N/A |
| grep.contextBefore | 1 | 1 | PASS_THROUGH | N/A | N/A |
| grep.contextAfter | 3 | 3 | PASS_THROUGH | N/A | N/A |

## `hideThinkingBlock`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| hideThinkingBlock | false | false | PASS_THROUGH | N/A | N/A |

## `hindsight.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| hindsight.apiUrl | "http://localhost:8888" | "http://localhost:8888" | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.apiToken | null | null | KAD_RESTRICTED | PASS | PASS |
| hindsight.bankId | null | null | KAD_RESTRICTED | PASS | PASS |
| hindsight.bankIdPrefix | null | null | KAD_RESTRICTED | PASS | PASS |
| hindsight.scoping | "per-project-tagged" | "per-project-tagged" | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.bankMission | null | null | KAD_RESTRICTED | PASS | PASS |
| hindsight.retainMission | null | null | KAD_RESTRICTED | PASS | PASS |
| hindsight.autoRecall | true | true | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.autoRetain | true | true | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.retainMode | "full-session" | "full-session" | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.retainEveryNTurns | 3 | 3 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.retainOverlapTurns | 2 | 2 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.retainContext | "omp" | "omp" | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallBudget | "mid" | "mid" | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallMaxTokens | 1024 | 1024 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallContextTurns | 1 | 1 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallMaxQueryChars | 800 | 800 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallTypes | ["world","experience"] | ["world","experience"] | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.debug | false | false | KAD_RESTRICTED | PASS | PASS |
| hindsight.requestTimeoutMs | 30000 | 30000 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.reflectTimeoutMs | 120000 | 120000 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.recallTimeoutMs | 30000 | 30000 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.retainTimeoutMs | 60000 | 60000 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.mentalModelsEnabled | true | true | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.mentalModelAutoSeed | true | true | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.mentalModelRefreshIntervalMs | 300000 | 300000 | KAD_RESTRICTED | FAIL | FAIL |
| hindsight.mentalModelMaxRenderChars | 16000 | 16000 | KAD_RESTRICTED | FAIL | FAIL |

## `images.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| images.autoResize | true | true | PASS_THROUGH | N/A | N/A |
| images.blockImages | false | false | PASS_THROUGH | N/A | N/A |
| images.describeForTextModels | true | true | PASS_THROUGH | N/A | N/A |
| images.urls.enabled | false | false | NOT_APPLICABLE | N/A | N/A |
| images.urls.backends | ["provider-files","tailscale","… | ["provider-files","tailscale","… | NOT_APPLICABLE | N/A | N/A |
| images.urls.options | {} | {} | NOT_APPLICABLE | N/A | N/A |
| images.urls.credentials | {} | null | NOT_APPLICABLE | N/A | N/A |
| images.urls.command | null | null | NOT_APPLICABLE | N/A | N/A |
| images.urls.publicBaseUrl | null | null | NOT_APPLICABLE | N/A | N/A |
| images.urls.ttlHours | 72 | 72 | NOT_APPLICABLE | N/A | N/A |
| images.urls.bindHost | "127.0.0.1" | "127.0.0.1" | NOT_APPLICABLE | N/A | N/A |
| images.urls.sshTarget | null | null | NOT_APPLICABLE | N/A | N/A |
| images.urls.sshRemotePort | 8787 | 8787 | NOT_APPLICABLE | N/A | N/A |

## `includeModelInPrompt`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| includeModelInPrompt | true | true | PASS_THROUGH | N/A | N/A |

## `includeWorkspaceTree`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| includeWorkspaceTree | false | false | PASS_THROUGH | N/A | N/A |

## `inlineToolDescriptors`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| inlineToolDescriptors | "auto" | "auto" | PASS_THROUGH | N/A | N/A |

## `inspect_image.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| inspect_image.enabled | false | false | PASS_THROUGH | N/A | N/A |
| inspect_image.mode | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| inspect_image.timeoutMs | 300000 | 300000 | PASS_THROUGH | N/A | N/A |

## `interruptMode`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| interruptMode | "immediate" | "immediate" | PASS_THROUGH | N/A | N/A |

## `irc.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| irc.timeoutMs | 120000 | 120000 | PASS_THROUGH | N/A | N/A |

## `julia.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| julia.interpreter | "" | "" | PASS_THROUGH | N/A | N/A |

## `launch.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| launch.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `live.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| live.voice | "sol" | "sol" | NOT_APPLICABLE | N/A | N/A |

## `loop.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| loop.mode | "prompt" | "prompt" | PASS_THROUGH | N/A | N/A |

## `lsp.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| lsp.enabled | true | true | PASS_THROUGH | N/A | N/A |
| lsp.lazy | true | true | PASS_THROUGH | N/A | N/A |
| lsp.shared | true | true | PASS_THROUGH | N/A | N/A |
| lsp.formatOnWrite | false | false | PASS_THROUGH | N/A | N/A |
| lsp.diagnosticsOnWrite | true | true | PASS_THROUGH | N/A | N/A |
| lsp.diagnosticsOnEdit | false | false | PASS_THROUGH | N/A | N/A |
| lsp.diagnosticsDeduplicate | true | true | PASS_THROUGH | N/A | N/A |

## `magicKeywords.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| magicKeywords.enabled | true | true | PASS_THROUGH | N/A | N/A |
| magicKeywords.ultrathink | true | true | PASS_THROUGH | N/A | N/A |
| magicKeywords.orchestrate | true | true | PASS_THROUGH | N/A | N/A |
| magicKeywords.workflow | true | true | PASS_THROUGH | N/A | N/A |

## `marketplace.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| marketplace.autoUpdate | "notify" | "notify" | PASS_THROUGH | N/A | N/A |

## `mcp.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| mcp.enableProjectConfig | true | true | PASS_THROUGH | N/A | N/A |
| mcp.renderMarkdownResults | true | true | PASS_THROUGH | N/A | N/A |
| mcp.notifications | false | false | PASS_THROUGH | N/A | N/A |
| mcp.notificationDebounceMs | 500 | 500 | PASS_THROUGH | N/A | N/A |

## `memories.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| memories.enabled | false | false | KAD_RESTRICTED | PASS | PASS |
| memories.maxRolloutsPerStartup | 64 | 64 | KAD_RESTRICTED | FAIL | FAIL |
| memories.maxRolloutAgeDays | 30 | 30 | KAD_RESTRICTED | FAIL | FAIL |
| memories.minRolloutIdleHours | 12 | 12 | KAD_RESTRICTED | FAIL | FAIL |
| memories.threadScanLimit | 300 | 300 | KAD_RESTRICTED | FAIL | FAIL |
| memories.maxRawMemoriesForGlobal | 200 | 200 | KAD_RESTRICTED | FAIL | FAIL |
| memories.stage1Concurrency | 8 | 8 | KAD_RESTRICTED | FAIL | FAIL |
| memories.stage1LeaseSeconds | 120 | 120 | KAD_RESTRICTED | FAIL | FAIL |
| memories.stage1RetryDelaySeconds | 120 | 120 | KAD_RESTRICTED | FAIL | FAIL |
| memories.phase2LeaseSeconds | 180 | 180 | KAD_RESTRICTED | FAIL | FAIL |
| memories.phase2RetryDelaySeconds | 180 | 180 | KAD_RESTRICTED | FAIL | FAIL |
| memories.phase2HeartbeatSeconds | 30 | 30 | KAD_RESTRICTED | FAIL | FAIL |
| memories.rolloutPayloadPercent | 0.7 | 0.7 | KAD_RESTRICTED | FAIL | FAIL |
| memories.phase1InputTokenLimit | 4000 | 4000 | KAD_RESTRICTED | FAIL | FAIL |
| memories.fallbackTokenLimit | 16000 | 16000 | KAD_RESTRICTED | FAIL | FAIL |
| memories.summaryInjectionTokenLimit | 5000 | 5000 | KAD_RESTRICTED | FAIL | FAIL |

## `memory.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| memory.backend | "off" | "mnemopi" | REQUIRES_HUMAN_POLICY | PASS | N/A |

## `minP`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| minP | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `mnemopi.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| mnemopi.dbPath | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.bank | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.scoping | "per-project" | "per-project" | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.embeddingVariant | "en" | "en" | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.autoRecall | true | true | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.autoRetain | true | true | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.polyphonicRecall | false | false | KAD_RESTRICTED | PASS | PASS |
| mnemopi.enhancedRecall | false | false | KAD_RESTRICTED | PASS | PASS |
| mnemopi.proactiveLinking | false | false | KAD_RESTRICTED | PASS | PASS |
| mnemopi.noEmbeddings | false | false | KAD_RESTRICTED | PASS | PASS |
| mnemopi.embeddingModel | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.embeddingApiUrl | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.embeddingApiKey | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.llmMode | "smol" | "smol" | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.llmBaseUrl | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.llmApiKey | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.llmModel | null | null | KAD_RESTRICTED | PASS | PASS |
| mnemopi.retainEveryNTurns | 4 | 4 | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.recallLimit | 8 | 8 | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.recallContextTurns | 3 | 3 | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.recallMaxQueryChars | 4000 | 4000 | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.injectionTokenLimit | 5000 | 5000 | KAD_RESTRICTED | FAIL | FAIL |
| mnemopi.debug | false | false | KAD_RESTRICTED | PASS | PASS |

## `model.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| model.loopGuard.enabled | true | true | PASS_THROUGH | N/A | N/A |
| model.loopGuard.checkAssistantContent | true | true | PASS_THROUGH | N/A | N/A |
| model.loopGuard.toolCallReminder | true | true | PASS_THROUGH | N/A | N/A |
| model.toolCallLoopGuard.enabled | true | true | PASS_THROUGH | N/A | N/A |
| model.toolCallLoopGuard.threshold | 5 | 5 | PASS_THROUGH | N/A | N/A |
| model.toolCallLoopGuard.exemptTools | ["hub"] | ["hub"] | PASS_THROUGH | N/A | N/A |

## `modelProviderOrder`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| modelProviderOrder | [] | [] | PASS_THROUGH | N/A | N/A |

## `modelRoles`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| modelRoles | {} | {"plan":"opencode-go/deepseek-v… | KAD_DEFAULT | N/A | N/A |

## `modelRoleStorage`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| modelRoleStorage | "global" | "project" | KAD_DEFAULT | FAIL | PASS |

## `modelTags`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| modelTags | {} | {"oracle":{"name":"Oracle (manu… | KAD_DEFAULT | N/A | N/A |

## `omitThinking`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| omitThinking | false | false | PASS_THROUGH | N/A | N/A |

## `paste.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| paste.largeMenuThreshold | 100 | 100 | PASS_THROUGH | N/A | N/A |

## `personality`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| personality | "default" | "default" | PASS_THROUGH | N/A | N/A |

## `plan.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| plan.enabled | true | true | PASS_THROUGH | N/A | N/A |
| plan.defaultOnStartup | false | false | PASS_THROUGH | N/A | N/A |

## `power.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| power.sleepPrevention | "idle" | "idle" | PASS_THROUGH | N/A | N/A |

## `presencePenalty`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| presencePenalty | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `prewalk.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| prewalk.enabled | false | false | PASS_THROUGH | N/A | N/A |

## `proseOnlyThinking`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| proseOnlyThinking | true | true | PASS_THROUGH | N/A | N/A |

## `provider.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| provider.appendOnlyContext | "auto" | "auto" | PASS_THROUGH | N/A | N/A |

## `providers.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| providers.maxInFlightRequests | {} | {} | PASS_THROUGH | N/A | N/A |
| providers.openai-codex.codeMode | "off" | "off" | NOT_APPLICABLE | N/A | N/A |
| providers.openai-codex.codeModeDirectTools | [] | [] | NOT_APPLICABLE | N/A | N/A |
| providers.anthropic.serverSideFallback | false | false | PASS_THROUGH | N/A | N/A |
| providers.ollama-cloud.maxConcurrency | 3 | 3 | NOT_APPLICABLE | N/A | N/A |
| providers.webSearchOrder | [] | ["gemini","perplexity","anthrop… | PASS_THROUGH | N/A | N/A |
| providers.webSearchExclude | [] | [] | PASS_THROUGH | N/A | N/A |
| providers.webSearchTimeoutSeconds | 60 | 60 | PASS_THROUGH | N/A | N/A |
| providers.webSearchGeminiModel | null | null | PASS_THROUGH | N/A | N/A |
| providers.antigravityEndpoint | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| providers.imageOrder | [] | [] | PASS_THROUGH | N/A | N/A |
| providers.fireworksTier | "standard" | "standard" | PASS_THROUGH | N/A | N/A |
| providers.tts | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| providers.tinyModel | "online" | "online" | PASS_THROUGH | N/A | N/A |
| providers.tinyModelDevice | "default" | "default" | PASS_THROUGH | N/A | N/A |
| providers.tinyModelDtype | "default" | "default" | PASS_THROUGH | N/A | N/A |
| providers.memoryModel | "online" | "online" | PASS_THROUGH | N/A | N/A |
| providers.autoThinkingModel | "online" | "online" | PASS_THROUGH | N/A | N/A |
| providers.autoThinkingMaxEffort | "xhigh" | "xhigh" | PASS_THROUGH | N/A | N/A |
| providers.unexpectedStopModel | "online" | "online" | PASS_THROUGH | N/A | N/A |
| providers.kimiApiFormat | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| providers.openaiWebsockets | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| providers.cacheRetention | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| providers.streamFirstEventTimeoutSeconds | -1 | -1 | PASS_THROUGH | N/A | N/A |
| providers.streamIdleTimeoutSeconds | -1 | -1 | PASS_THROUGH | N/A | N/A |
| providers.openrouterVariant | "default" | "default" | PASS_THROUGH | N/A | N/A |
| providers.fetch | "auto" | "auto" | PASS_THROUGH | N/A | N/A |

## `python.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| python.kernelMode | "session" | "session" | PASS_THROUGH | N/A | N/A |
| python.interpreter | "" | "" | PASS_THROUGH | N/A | N/A |

## `read.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| read.defaultLimit | 300 | 300 | PASS_THROUGH | N/A | N/A |
| read.renderMarkdown | false | false | PASS_THROUGH | N/A | N/A |
| read.summarize.enabled | true | true | PASS_THROUGH | N/A | N/A |
| read.summarize.prose | false | false | PASS_THROUGH | N/A | N/A |
| read.summarize.minBodyLines | 4 | 4 | PASS_THROUGH | N/A | N/A |
| read.summarize.minCommentLines | 6 | 6 | PASS_THROUGH | N/A | N/A |
| read.summarize.minTotalLines | 100 | 100 | PASS_THROUGH | N/A | N/A |
| read.summarize.unfoldUntil | 50 | 50 | PASS_THROUGH | N/A | N/A |
| read.summarize.unfoldLimit | 100 | 100 | PASS_THROUGH | N/A | N/A |
| read.toolResultPreview | false | false | PASS_THROUGH | N/A | N/A |

## `readLineNumbers`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| readLineNumbers | false | false | PASS_THROUGH | N/A | N/A |

## `recap.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| recap.enabled | true | false | KAD_RESTRICTED | FAIL | PASS |
| recap.idleSeconds | 240 | 240 | KAD_RESTRICTED | FAIL | FAIL |

## `repetitionPenalty`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| repetitionPenalty | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `retry.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| retry.enabled | true | true | KAD_WRAPPED | N/A | N/A |
| retry.maxRetries | 10 | 10 | KAD_WRAPPED | N/A | N/A |
| retry.baseDelayMs | 500 | 500 | KAD_WRAPPED | N/A | N/A |
| retry.maxDelayMs | 300000 | 0 | KAD_WRAPPED | N/A | N/A |
| retry.modelFallback | true | true | KAD_WRAPPED | N/A | N/A |
| retry.usageAwareFallback | false | true | KAD_WRAPPED | N/A | N/A |
| retry.usageReservePct | 10 | 5 | KAD_WRAPPED | N/A | N/A |
| retry.usageReservePolicy | "confirm" | "confirm" | KAD_WRAPPED | N/A | N/A |
| retry.fallbackChains | {} | {"default":["openai-codex/gpt-5… | KAD_WRAPPED | N/A | N/A |
| retry.fallbackRevertPolicy | "cooldown-expiry" | "cooldown-expiry" | KAD_WRAPPED | N/A | N/A |

## `ruby.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| ruby.interpreter | "" | "" | PASS_THROUGH | N/A | N/A |

## `searxng.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| searxng.endpoint | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.token | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.basicUsername | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.basicPassword | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.categories | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.engines | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.language | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |
| searxng.safesearch | null | null | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `secrets.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| secrets.enabled | false | false | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `security.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| security.enabled | false | true | PASS_THROUGH | N/A | N/A |

## `setupVersion`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| setupVersion | 0 | 2 | PASS_THROUGH | N/A | N/A |

## `share.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| share.serverUrl | "https://my.omp.sh/s" | "https://my.omp.sh/s" | REQUIRES_HUMAN_POLICY | N/A | N/A |
| share.store | "blob" | "blob" | REQUIRES_HUMAN_POLICY | N/A | N/A |
| share.redactSecrets | true | true | REQUIRES_HUMAN_POLICY | N/A | N/A |

## `sharpshooter.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| sharpshooter.model | null | null | KAD_RESTRICTED | PASS | PASS |
| sharpshooter.intervalMinutes | 5 | 5 | KAD_RESTRICTED | FAIL | FAIL |
| sharpshooter.injectionTokenLimit | 15000 | 15000 | KAD_RESTRICTED | FAIL | FAIL |

## `shellMinimizer.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| shellMinimizer.enabled | true | true | PASS_THROUGH | N/A | N/A |
| shellMinimizer.settingsPath | null | null | PASS_THROUGH | N/A | N/A |
| shellMinimizer.only | [] | [] | PASS_THROUGH | N/A | N/A |
| shellMinimizer.except | [] | [] | PASS_THROUGH | N/A | N/A |
| shellMinimizer.maxCaptureBytes | 4194304 | 4194304 | PASS_THROUGH | N/A | N/A |
| shellMinimizer.sourceOutlineLevel | "default" | "default" | PASS_THROUGH | N/A | N/A |
| shellMinimizer.legacyFilters | null | null | PASS_THROUGH | N/A | N/A |

## `shellPath`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| shellPath | null | null | PASS_THROUGH | N/A | N/A |

## `showHardwareCursor`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| showHardwareCursor | true | true | PASS_THROUGH | N/A | N/A |

## `skills.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| skills.enabled | true | true | KAD_DEFAULT | PASS | PASS |
| skills.enableSkillCommands | true | true | PASS_THROUGH | N/A | N/A |
| skills.enableCodexUser | true | true | PASS_THROUGH | N/A | N/A |
| skills.enableClaudeUser | true | true | PASS_THROUGH | N/A | N/A |
| skills.enableClaudeProject | true | true | PASS_THROUGH | N/A | N/A |
| skills.enablePiUser | true | true | PASS_THROUGH | N/A | N/A |
| skills.enablePiProject | true | false | KAD_DEFAULT | FAIL | PASS |
| skills.enableAgentsUser | true | true | PASS_THROUGH | N/A | N/A |
| skills.enableAgentsProject | true | true | KAD_DEFAULT | PASS | PASS |
| skills.customDirectories | [] | [] | PASS_THROUGH | N/A | N/A |
| skills.ignoredSkills | [] | [] | PASS_THROUGH | N/A | N/A |
| skills.includeSkills | [] | [] | PASS_THROUGH | N/A | N/A |

## `snapcompact.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| snapcompact.systemPrompt | "none" | "none" | PASS_THROUGH | N/A | N/A |
| snapcompact.toolResults | false | false | PASS_THROUGH | N/A | N/A |
| snapcompact.shape | "auto" | "auto" | PASS_THROUGH | N/A | N/A |

## `speech.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| speech.enabled | false | false | NOT_APPLICABLE | N/A | N/A |
| speech.mode | "assistant" | "assistant" | NOT_APPLICABLE | N/A | N/A |
| speech.enhanced | false | false | NOT_APPLICABLE | N/A | N/A |
| speech.voice | "af_heart" | "af_heart" | NOT_APPLICABLE | N/A | N/A |

## `speechgen.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| speechgen.enabled | false | false | PASS_THROUGH | N/A | N/A |

## `spelling.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| spelling.typoDetection | true | true | PASS_THROUGH | N/A | N/A |
| spelling.autocomplete | true | true | PASS_THROUGH | N/A | N/A |
| spelling.autocorrect | false | false | PASS_THROUGH | N/A | N/A |

## `startup.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| startup.quiet | false | false | PASS_THROUGH | N/A | N/A |
| startup.showSplash | false | false | PASS_THROUGH | N/A | N/A |
| startup.setupWizard | true | true | PASS_THROUGH | N/A | N/A |
| startup.checkUpdate | true | true | PASS_THROUGH | N/A | N/A |
| startup.changelogMode | "summary" | "summary" | PASS_THROUGH | N/A | N/A |

## `statusLine.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| statusLine.preset | "default" | "default" | PASS_THROUGH | N/A | N/A |
| statusLine.separator | "powerline-thin" | "powerline-thin" | PASS_THROUGH | N/A | N/A |
| statusLine.contextLine | "embedded" | "embedded" | PASS_THROUGH | N/A | N/A |
| statusLine.sessionAccent | true | true | PASS_THROUGH | N/A | N/A |
| statusLine.transparent | false | false | PASS_THROUGH | N/A | N/A |
| statusLine.compactThinkingLevel | true | true | PASS_THROUGH | N/A | N/A |
| statusLine.showHookStatus | true | true | PASS_THROUGH | N/A | N/A |
| statusLine.leftSegments | [] | [] | PASS_THROUGH | N/A | N/A |
| statusLine.rightSegments | [] | [] | PASS_THROUGH | N/A | N/A |
| statusLine.segmentOptions | {} | {} | PASS_THROUGH | N/A | N/A |

## `steeringMode`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| steeringMode | "one-at-a-time" | "one-at-a-time" | PASS_THROUGH | N/A | N/A |

## `stt.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| stt.enabled | false | false | PASS_THROUGH | N/A | N/A |
| stt.language | "en" | "en" | PASS_THROUGH | N/A | N/A |
| stt.modelName | "parakeet" | "parakeet" | PASS_THROUGH | N/A | N/A |
| stt.submitTrigger | "never" | "never" | PASS_THROUGH | N/A | N/A |

## `symbolPreset`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| symbolPreset | "unicode" | "unicode" | PASS_THROUGH | N/A | N/A |

## `task.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| task.isolation.mode | "none" | "none" | PASS_THROUGH | N/A | N/A |
| task.isolation.apply | true | true | PASS_THROUGH | N/A | N/A |
| task.isolation.merge | "patch" | "patch" | PASS_THROUGH | N/A | N/A |
| task.isolation.commits | "generic" | "generic" | PASS_THROUGH | N/A | N/A |
| task.eager | "default" | "default" | PASS_THROUGH | N/A | N/A |
| task.batch | true | true | PASS_THROUGH | N/A | N/A |
| task.enableEffort | false | false | PASS_THROUGH | N/A | N/A |
| task.maxConcurrency | 32 | 32 | PASS_THROUGH | N/A | N/A |
| task.enableLsp | false | false | PASS_THROUGH | N/A | N/A |
| task.maxRecursionDepth | 2 | 2 | PASS_THROUGH | N/A | N/A |
| task.maxRuntimeMs | 0 | 0 | PASS_THROUGH | N/A | N/A |
| task.agentIdleTtlMs | 420000 | 420000 | PASS_THROUGH | N/A | N/A |
| task.softRequestBudget | 200 | 200 | PASS_THROUGH | N/A | N/A |
| task.softRequestBudgetNotice | true | true | PASS_THROUGH | N/A | N/A |
| task.maxEffort | "max" | "max" | PASS_THROUGH | N/A | N/A |
| task.disabledAgents | [] | [] | PASS_THROUGH | N/A | N/A |
| task.agentModelOverrides | {} | {"kad-master":"@plan","kad-buil… | KAD_WRAPPED | N/A | N/A |
| task.agentPrewalk | {} | {} | PASS_THROUGH | N/A | N/A |
| task.agentAdvisor | {} | {"kad-master":"off","kad-builde… | KAD_WRAPPED | N/A | N/A |
| task.prewalk | false | false | PASS_THROUGH | N/A | N/A |
| task.showResolvedModelBadge | false | false | PASS_THROUGH | N/A | N/A |

## `tasks.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| tasks.todoClearDelay | 60 | 60 | PASS_THROUGH | N/A | N/A |

## `temperature`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| temperature | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `terminal.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| terminal.showImages | true | true | PASS_THROUGH | N/A | N/A |
| terminal.showProgress | false | false | PASS_THROUGH | N/A | N/A |

## `textVerbosity`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| textVerbosity | "medium" | "medium" | PASS_THROUGH | N/A | N/A |

## `theme.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| theme.dark | "titanium" | "obsidian" | PASS_THROUGH | N/A | N/A |
| theme.light | "light" | "light" | PASS_THROUGH | N/A | N/A |

## `thinkingBudgets.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| thinkingBudgets.minimal | 1024 | 1024 | PASS_THROUGH | N/A | N/A |
| thinkingBudgets.low | 2048 | 2048 | PASS_THROUGH | N/A | N/A |
| thinkingBudgets.medium | 8192 | 8192 | PASS_THROUGH | N/A | N/A |
| thinkingBudgets.high | 16384 | 16384 | PASS_THROUGH | N/A | N/A |
| thinkingBudgets.xhigh | 32768 | 32768 | PASS_THROUGH | N/A | N/A |
| thinkingBudgets.max | 32768 | 32768 | PASS_THROUGH | N/A | N/A |

## `tier.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| tier.openai | "none" | "none" | PASS_THROUGH | N/A | N/A |
| tier.anthropic | "none" | "none" | PASS_THROUGH | N/A | N/A |
| tier.google | "none" | "none" | PASS_THROUGH | N/A | N/A |
| tier.subagent | "inherit" | "inherit" | PASS_THROUGH | N/A | N/A |
| tier.advisor | "none" | "none" | PASS_THROUGH | N/A | N/A |

## `title.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| title.refreshOnReplan | true | true | PASS_THROUGH | N/A | N/A |

## `todo.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| todo.enabled | true | true | PASS_THROUGH | N/A | N/A |
| todo.reminders | true | true | PASS_THROUGH | N/A | N/A |
| todo.remindersMax | 3 | 3 | PASS_THROUGH | N/A | N/A |
| todo.eager | "default" | "default" | PASS_THROUGH | N/A | N/A |

## `tools.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| tools.artifactSpillThreshold | 50 | 50 | PASS_THROUGH | N/A | N/A |
| tools.artifactTailBytes | 20 | 20 | PASS_THROUGH | N/A | N/A |
| tools.artifactHeadBytes | 20 | 20 | PASS_THROUGH | N/A | N/A |
| tools.outputMaxColumns | 768 | 768 | PASS_THROUGH | N/A | N/A |
| tools.artifactTailLines | 500 | 500 | PASS_THROUGH | N/A | N/A |
| tools.format | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| tools.approval | {} | {} | REQUIRES_HUMAN_POLICY | N/A | N/A |
| tools.approvalMode | "yolo" | "yolo" | REQUIRES_HUMAN_POLICY | N/A | N/A |
| tools.intentTracing | true | true | PASS_THROUGH | N/A | N/A |
| tools.abortOnFabricatedResult | true | true | PASS_THROUGH | N/A | N/A |
| tools.maxTimeout | 0 | 0 | PASS_THROUGH | N/A | N/A |
| tools.xdev | true | true | PASS_THROUGH | N/A | N/A |
| tools.xdevDocs | "builtins" | "catalog" | PASS_THROUGH | N/A | N/A |
| tools.xdevInlineDevices | [] | [] | PASS_THROUGH | N/A | N/A |

## `topK`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| topK | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `topP`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| topP | -1 | -1 | PASS_THROUGH | N/A | N/A |

## `treeFilterMode`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| treeFilterMode | "default" | "default" | PASS_THROUGH | N/A | N/A |

## `tts.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| tts.localModel | "kokoro" | "kokoro" | NOT_APPLICABLE | N/A | N/A |
| tts.localVoice | "af_heart" | "af_heart" | NOT_APPLICABLE | N/A | N/A |

## `ttsr.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| ttsr.enabled | true | false | KAD_RESTRICTED | FAIL | PASS |
| ttsr.contextMode | "discard" | "discard" | KAD_RESTRICTED | FAIL | FAIL |
| ttsr.interruptMode | "always" | "always" | KAD_RESTRICTED | FAIL | FAIL |
| ttsr.repeatMode | "once" | "once" | KAD_RESTRICTED | FAIL | FAIL |
| ttsr.repeatGap | 10 | 10 | KAD_RESTRICTED | FAIL | FAIL |
| ttsr.builtinRules | true | true | KAD_RESTRICTED | FAIL | FAIL |
| ttsr.disabledRules | [] | [] | KAD_RESTRICTED | FAIL | FAIL |

## `tui.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| tui.maxInlineImageColumns | 100 | 100 | PASS_THROUGH | N/A | N/A |
| tui.maxInlineImageRows | 20 | 20 | PASS_THROUGH | N/A | N/A |
| tui.maxInlineImages | 8 | 8 | PASS_THROUGH | N/A | N/A |
| tui.resizeScrollback | "rebuild" | "rebuild" | PASS_THROUGH | N/A | N/A |
| tui.textSizing | false | false | PASS_THROUGH | N/A | N/A |
| tui.renderMermaid | true | true | PASS_THROUGH | N/A | N/A |
| tui.codexResetFireworks | false | false | PASS_THROUGH | N/A | N/A |
| tui.titleState | true | true | PASS_THROUGH | N/A | N/A |
| tui.hyperlinks | "auto" | "auto" | PASS_THROUGH | N/A | N/A |
| tui.tight | false | false | PASS_THROUGH | N/A | N/A |
| tui.imeSafeCursor | false | false | PASS_THROUGH | N/A | N/A |

## `update.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| update.channel | "stable" | "stable" | PASS_THROUGH | N/A | N/A |

## `vault.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| vault.enabled | false | true | PASS_THROUGH | N/A | N/A |

## `web_search.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| web_search.enabled | true | true | PASS_THROUGH | N/A | N/A |

## `workspace.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| workspace.additionalDirectories | [] | [] | PASS_THROUGH | N/A | N/A |

## `worktree.*`

| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |
|---|---|---|---|---|---|
| worktree.base | null | null | PASS_THROUGH | N/A | N/A |
