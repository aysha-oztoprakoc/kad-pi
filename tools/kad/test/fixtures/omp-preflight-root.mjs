/**
 * Shared temp-root fixture for OMP preflight tests.
 *
 * `inspectPreflight` reads its learning, spend, skills and authority facts from the
 * checkout it is pointed at. A test that wants to assert a *section* verdict must
 * therefore hand it a root whose `.omp/config.yml` declares the posture under test —
 * otherwise the operator's live posture leaks into the aggregate `status` and the
 * assertion silently stops testing what it names.
 *
 * Everything a fixture writes is deterministic; nothing outside the temp root is read
 * except by the caller.
 */
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/** Managed OMP version the fixture installs under a synthetic mise root (ADR 0018). */
export const FIXTURE_OMP_VERSION = '18.1.18';

/** Version of the staged pin the fixture leaves behind: drift evidence, never authority. */
export const FIXTURE_STAGED_OMP_VERSION = '18.0.9';

/** Path of the fixture's mise-managed OMP binary, relative to a fixture root. */
export function fixtureOmpBinary(root) {
  return join(root, 'mise-data', 'installs', 'github-can1357-oh-my-pi', FIXTURE_OMP_VERSION, 'omp');
}

/**
 * The harness observations a fixture root implies.
 *
 * `inspectOmp` resolves the executing binary from `OMP_BINARY`, then PATH, then the canary.
 * A test must never depend on the host's PATH, so fixtures inject both the binary and the
 * version they installed.
 */
export function ompObservation(root) {
  return { ompBinary: fixtureOmpBinary(root), ompVersion: FIXTURE_OMP_VERSION };
}

const savedMiseDataDir = new Map();

/** Neutral two-endpoint model map: WORLD is external, retrieval is STC-owned. */
export const DEFAULT_MODELS_YAML = `providers:
  kad-local-world:
    baseUrl: http://127.0.0.1:5001/v1
    auth: none
    models:
      - id: kad-local-s13
        contextWindow: 4096
  kad-local-qwen:
    baseUrl: http://127.0.0.1:5002/v1
    auth: none
    models:
      - id: qwen-local
        contextWindow: 4096
`;

/**
 * Creates a synthetic checkout the preflight can be evaluated against.
 *
 * @param {'qwen'|'world'|'missing'} [options.role] local retrieval role binding
 * @param {boolean} [options.autolearn] `autolearn.enabled` in the fixture config
 * @param {string}  [options.memory] `memory.backend` in the fixture config
 * @param {'safe'|'unsafe'} [options.spend] `enabledModels` surface in the fixture config
 * @param {boolean} [options.omp] whether the pinned OMP binary, wrapper and manifest exist
 * @param {string}  [options.modelsYaml] body of the fixture `.omp/models.yml`
 * @param {object}  [options.externalProviders] body of `config/external-providers.json`
 * @param {string[]|null} [options.enabledModels] explicit `enabledModels` entries
 * @param {object|null} [options.declaration] posture keys to declare differently from the config,
 *   which is how the declaration-drift path is exercised
 * @param {boolean} [options.localRouterContracts] whether the authority-boundary sources exist
 * @returns {Promise<string>} fixture root, ready for `inspectPreflight({ root })`
 */
export async function createOmpPreflightFixture({
  role = 'qwen',
  autolearn = false,
  memory = 'off',
  spend = 'safe',
  omp = true,
  modelsYaml = DEFAULT_MODELS_YAML,
  externalProviders = null,
  enabledModels = null,
  declaration = null,
  localRouterContracts = true
} = {}) {
  const root = await mkdtemp(join(tmpdir(), 'kad-omp-preflight-'));
  await mkdir(join(root, '.omp', 'agents'), { recursive: true });
  await mkdir(join(root, '.agents', 'skills', 'kad-evidence-gate'), { recursive: true });
  await mkdir(join(root, 'tools', 'kad', 'test'), { recursive: true });
  await writeFile(join(root, 'PRIME_DIRECTIVE.md'), '# PRIME DIRECTIVE\n');
  await writeFile(join(root, '.omp', 'AGENTS.md'), 'This is a pointer to PRIME_DIRECTIVE.md.\n');
  await writeFile(join(root, '.agents', 'skills', 'kad-evidence-gate', 'SKILL.md'), 'evidence gate\n');
  if (localRouterContracts) {
    await writeFile(join(root, 'tools', 'kad', 'local-router.mjs'), 'requirement.trust_domain === resource.trust_domain\n');
    await writeFile(join(root, 'tools', 'kad', 'test', 'local-router.test.mjs'), "'WORLD resources cannot satisfy retrieval or engineering requirements'\n");
  }
  if (externalProviders) {
    await mkdir(join(root, 'config'), { recursive: true });
    await writeFile(join(root, 'config', 'external-providers.json'), `${JSON.stringify(externalProviders, null, 2)}\n`);
  }
  if (omp) {
    await mkdir(join(root, 'bin'), { recursive: true });
    const wrapper = join(root, 'bin', 'omp-kad');
    await writeFile(wrapper, '#!/bin/sh\n');
    await chmod(wrapper, 0o755);
    // The active harness is the mise-managed build; the preflight reads its version by execution.
    const binary = fixtureOmpBinary(root);
    await mkdir(join(binary, '..'), { recursive: true });
    await writeFile(binary, `#!/bin/sh\necho "omp/${FIXTURE_OMP_VERSION}"\n`);
    await chmod(binary, 0o755);
    // Everything below is what ADR 0018 superseded: reported as drift, never as the harness.
    await mkdir(join(root, '.tools', 'oh-my-pi'), { recursive: true });
    await writeFile(join(root, '.tools', 'oh-my-pi', `v${FIXTURE_STAGED_OMP_VERSION}`), 'staged binary');
    await writeFile(join(root, '.omp', 'install-manifest.json'), JSON.stringify({ release: FIXTURE_STAGED_OMP_VERSION, omp_version_output: `omp v${FIXTURE_STAGED_OMP_VERSION}` }));
  }
  // `miseInstallsRoot()` honours MISE_DATA_DIR, so pointing it at the fixture keeps provenance
  // assertions hermetic instead of depending on where this host installs its tools.
  savedMiseDataDir.set(root, process.env.MISE_DATA_DIR);
  process.env.MISE_DATA_DIR = join(root, 'mise-data');
  const roleYaml = role === 'qwen' ? '  local_retrieval: "kad-local-qwen/qwen-local:low"\n' : role === 'world' ? '  world: "kad-local-world/kad-local-s13:low"\n' : '';
  const enabled = role === 'qwen' ? '  - "kad-local-qwen/qwen-local"\n  - "kad-local-world/*"\n' : '  - "kad-local-world/*"\n';
  const spendYaml = spend === 'unsafe' ? '  - "*"\n' : enabledModels ? enabledModels.map((entry) => `  - "${entry}"\n`).join('') : enabled;
  await writeFile(join(root, '.omp', 'config.yml'), `modelRoles:\n${roleYaml}enabledModels:\n${spendYaml}advisor:\n  enabled: false\ntools:\n  approvalMode: yolo\nmemory:\n  backend: "${memory}"\nautolearn:\n  enabled: ${autolearn}\nsecrets:\n  enabled: false\nttsr:\n  enabled: false\nrecap:\n  enabled: false\nskills:\n  enableAgentsProject: true\n`);
  // The posture is declared, not pinned: the preflight compares this block against the config
  // above, so a fixture states both. `declaration` overrides a key to exercise a mismatch.
  const declared = {
    'tools.approvalMode': 'yolo',
    'memory.backend': memory,
    'autolearn.enabled': String(autolearn),
    'secrets.enabled': 'false',
    'ttsr.enabled': 'false',
    'recap.enabled': 'false',
    ...(declaration ?? {})
  };
  await writeFile(join(root, '.omp', 'RULES.md'), `KAD authority outranks OMP.\n\n\`\`\`yaml\nposture:\n${Object.entries(declared).map(([key, value]) => `  ${key}: ${value}`).join('\n')}\n\`\`\`\n`);
  await writeFile(join(root, '.omp', 'models.yml'), modelsYaml);
  return root;
}

/** Removes a fixture root created by {@link createOmpPreflightFixture} and restores its env. */
export async function removeOmpPreflightFixture(root) {
  const previous = savedMiseDataDir.get(root);
  if (previous === undefined) delete process.env.MISE_DATA_DIR;
  else process.env.MISE_DATA_DIR = previous;
  savedMiseDataDir.delete(root);
  await rm(root, { recursive: true, force: true });
}
