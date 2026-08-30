import fs from 'node:fs';
import path from 'node:path';
import { createTelemetryRecord } from './schema.mjs';

function parseYamlScalar(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~' || val === '') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(val)) return Number(val);
  return val.replace(/^['"]|['"]$/g, '');
}

export function parseOmpYamlString(content) {
  if (!content || typeof content !== 'string') return {};
  const lines = content.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, container: root, key: null }];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const withoutComment = raw.replace(/\s+#.*$/, '');
    if (!withoutComment.trim() || withoutComment.trim().startsWith('#')) continue;

    const indent = raw.match(/^ */)[0].length;
    const trimmed = withoutComment.trim();

    if (trimmed === '[]') {
      const top = stack[stack.length - 1];
      if (top && top.key && top.container) {
        top.container[top.key] = [];
      }
      continue;
    }

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const top = stack[stack.length - 1];

    if (trimmed.startsWith('- ')) {
      const itemText = trimmed.slice(2).trim();
      const activeArr = Array.isArray(top.container) ? top.container : (top.key ? top.container[top.key] : null);
      if (Array.isArray(activeArr)) {
        const kvMatch = itemText.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (kvMatch) {
          const k = kvMatch[1].trim();
          const v = kvMatch[2].trim();
          const obj = { [k]: parseYamlScalar(v) };
          activeArr.push(obj);
          stack.push({ indent, container: obj, key: k });
        } else {
          activeArr.push(parseYamlScalar(itemText));
        }
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const valText = trimmed.slice(colonIdx + 1).trim();

    if (valText === '' || valText === '[]' || valText === '{}') {
      const nextNonEmpty = lines.slice(i + 1).find((l) => l.replace(/#.*$/, '').trim());
      const nextIndent = nextNonEmpty ? nextNonEmpty.match(/^ */)[0].length : indent;
      const isNextList = nextNonEmpty ? nextNonEmpty.replace(/#.*$/, '').trim().startsWith('- ') : false;
      const isNextEmptyArray = nextNonEmpty ? nextNonEmpty.replace(/#.*$/, '').trim() === '[]' : false;

      const newContainer = (valText === '[]' || isNextEmptyArray || (valText === '' && isNextList && nextIndent > indent)) ? [] : {};
      if (Array.isArray(top.container)) {
        top.container.push({ [key]: newContainer });
      } else {
        top.container[key] = newContainer;
      }
      stack.push({ indent, container: newContainer, key });
    } else {
      const parsedVal = parseYamlScalar(valText);
      if (Array.isArray(top.container)) {
        top.container.push({ [key]: parsedVal });
      } else {
        top.container[key] = parsedVal;
      }
      top.key = key;
    }
  }
  return root;
}

export function parseOmpYaml(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return parseOmpYamlString(raw) || {};
  } catch {
    return {};
  }
}

export function parseOmpJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function discoverProviders({
  cwd = process.cwd(),
  config = null,
  usageReports = null,
} = {}) {
  const ompDir = path.join(cwd, '.omp');
  const projectConfig = config || parseOmpYaml(path.join(ompDir, 'config.yml'));
  const modelsConfig = parseOmpYaml(path.join(ompDir, 'models.yml'));
  const controllers = parseOmpJson(path.join(ompDir, 'controllers.json'));

  const discovered = new Map();

  const disabledSet = new Set(projectConfig.disabledProviders || []);

  // 1. Scan modelRoles
  const roles = projectConfig.modelRoles || {};
  for (const [role, spec] of Object.entries(roles)) {
    if (!spec || typeof spec !== 'string') continue;
    const [target] = spec.split(':');
    const [provider, model] = target.split('/');
    if (provider && model) {
      if (!discovered.has(provider)) {
        discovered.set(provider, {
          provider_id: provider,
          configured: !disabledSet.has(provider),
          enabled: !disabledSet.has(provider),
          models: new Set(),
          roles: new Set(),
          telemetry_adapter: getAdapterName(provider),
          classification: getProviderClassification(provider),
        });
      }
      const entry = discovered.get(provider);
      entry.models.add(model);
      entry.roles.add(role);
    }
  }

  // 2. Scan fallbackChains
  const chains = projectConfig.retry?.fallbackChains || {};
  for (const [_, chain] of Object.entries(chains)) {
    if (Array.isArray(chain)) {
      for (const target of chain) {
        if (typeof target !== 'string') continue;
        const [clean] = target.split(':');
        const [provider, model] = clean.split('/');
        if (provider && model) {
          if (!discovered.has(provider)) {
            discovered.set(provider, {
              provider_id: provider,
              configured: !disabledSet.has(provider),
              enabled: !disabledSet.has(provider),
              models: new Set(),
              roles: new Set(),
              telemetry_adapter: getAdapterName(provider),
              classification: getProviderClassification(provider),
            });
          }
          discovered.get(provider).models.add(model);
        }
      }
    }
  }

  // 3. Scan enabledModels
  const enabledModels = projectConfig.enabledModels || [];
  for (const pattern of enabledModels) {
    if (typeof pattern !== 'string') continue;
    const [provider, model] = pattern.split('/');
    if (provider) {
      if (!discovered.has(provider)) {
        discovered.set(provider, {
          provider_id: provider,
          configured: !disabledSet.has(provider),
          enabled: !disabledSet.has(provider),
          models: new Set(),
          roles: new Set(),
          telemetry_adapter: getAdapterName(provider),
          classification: getProviderClassification(provider),
        });
      }
      if (model && model !== '*') discovered.get(provider).models.add(model);
    }
  }

  // 4. Include disabled providers explicitly
  for (const disabledProvider of disabledSet) {
    if (!discovered.has(disabledProvider)) {
      discovered.set(disabledProvider, {
        provider_id: disabledProvider,
        configured: false,
        enabled: false,
        models: new Set(),
        roles: new Set(),
        telemetry_adapter: getAdapterName(disabledProvider),
        classification: getProviderClassification(disabledProvider),
      });
    } else {
      const entry = discovered.get(disabledProvider);
      entry.configured = false;
      entry.enabled = false;
    }
  }

  // Map into structured provider inventory
  return Array.from(discovered.values()).map((p) => ({
    provider_id: p.provider_id,
    configured: p.configured,
    enabled: p.enabled,
    models: Array.from(p.models),
    roles: Array.from(p.roles),
    telemetry_adapter: p.telemetry_adapter,
    classification: p.classification,
  }));
}

function getAdapterName(providerId) {
  if (providerId.includes('local')) return 'kad-local-adapter';
  if (['openai-codex', 'openai', 'anthropic', 'google-antigravity', 'gemini'].includes(providerId)) {
    return 'omp-native-usage-adapter';
  }
  return 'kad-generic-adapter';
}

function getProviderClassification(providerId) {
  if (providerId.includes('local')) return 'LOCAL';
  if (providerId.includes('free') || providerId === 'zai-free') return 'FREE';
  if (['openai-codex', 'anthropic', 'google-antigravity'].includes(providerId)) return 'SUBSCRIPTION';
  return 'PAYG';
}

export function createProviderTelemetry({
  providerId,
  ompUsageReport = null,
  observedUsage = null,
  now = Date.now(),
} = {}) {
  // If we have an authoritative report from OMP usage:
  if (ompUsageReport && Array.isArray(ompUsageReport.limits) && ompUsageReport.limits.length > 0) {
    const records = [];
    for (const limit of ompUsageReport.limits) {
      const unit = limit.amount?.unit ?? 'percent';
      const metric = unit === 'tokens' ? 'total_tokens' : unit === 'requests' ? 'requests' : unit === 'messages' ? 'messages' : 'quota_percent';
      const quotaLimit = limit.amount?.limit ?? null;
      const quotaUsed = limit.amount?.used ?? null;
      const quotaRemaining = limit.amount?.remaining ?? null;

      records.push(
        createTelemetryRecord({
          provider_id: providerId,
          metric,
          unit,
          window: {
            kind: limit.window?.label ?? limit.window?.id ?? 'window',
            resets_at: limit.window?.resetsAt ?? null,
          },
          quota: {
            limit: quotaLimit,
            used: quotaUsed,
            remaining: quotaRemaining,
          },
          source: {
            class: 'AUTHORITATIVE_REMOTE',
            adapter: 'omp-usage-report',
            evidence_ref: limit.id,
          },
          observed_at: ompUsageReport.fetchedAt ?? now,
          state: 'AUTHORITATIVE_REMOTE',
        })
      );
    }
    return records;
  }

  // If we only have locally observed usage with unknown limits:
  if (observedUsage) {
    return [
      createTelemetryRecord({
        provider_id: providerId,
        metric: 'total_tokens',
        unit: 'tokens',
        quota: {
          limit: null,
          used: observedUsage.totalTokens ?? null,
          remaining: null,
        },
        source: {
          class: 'OBSERVED',
          adapter: 'omp-session-tracker',
        },
        observed_at: now,
        state: 'UNKNOWN',
      }),
    ];
  }

  // Fully unknown / unobserved:
  return [
    createTelemetryRecord({
      provider_id: providerId,
      metric: 'total_tokens',
      unit: 'tokens',
      quota: {
        limit: null,
        used: null,
        remaining: null,
      },
      source: {
        class: 'UNKNOWN',
        adapter: 'none',
      },
      observed_at: now,
      state: 'UNKNOWN',
    }),
  ];
}
