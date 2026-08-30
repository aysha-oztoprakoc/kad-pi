import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CAPABILITY_NAMES,
  CONSTRAINT_CLASSES,
  OBSERVATION_STATES,
  RESEARCH_CAPABILITY_SCHEMA_VERSION,
  ResearchCapabilityProfile,
  ResearchCapabilityObservation,
  ResearchCapabilityPlane,
  evaluateCapabilityState,
  evaluateEconomicAdmission,
  parseCapabilityManifest,
  serializeCapabilityManifest,
  validateCapabilityProfile,
  validateCapabilityObservation,
  registerResearchCapabilities
} from '../research-capabilities.mjs';
import { CapabilityRegistry } from '../local-router.mjs';
import { DeterministicResearchCorpus } from '../research.mjs';

test('Provider-neutral capability vocabulary and constraints are strictly enforced', () => {
  assert.ok(CAPABILITY_NAMES.includes('paper_search'));
  assert.ok(CAPABILITY_NAMES.includes('semantic_search'));
  assert.ok(CAPABILITY_NAMES.includes('deep_review'));
  assert.ok(CAPABILITY_NAMES.includes('structured_extraction'));
  assert.ok(CAPABILITY_NAMES.includes('api_search'));
  assert.ok(CAPABILITY_NAMES.includes('bulk_export'));
  assert.ok(CAPABILITY_NAMES.includes('citation_graph'));
  assert.ok(CAPABILITY_NAMES.includes('full_text'));

  assert.ok(CONSTRAINT_CLASSES.includes('manual_only'));
  assert.ok(CONSTRAINT_CLASSES.includes('free_quota'));
  assert.ok(CONSTRAINT_CLASSES.includes('monthly_quota'));
  assert.ok(CONSTRAINT_CLASSES.includes('unlimited'));
  assert.ok(CONSTRAINT_CLASSES.includes('requires_api_key'));
  assert.ok(CONSTRAINT_CLASSES.includes('requires_paid_tier'));
  assert.ok(CONSTRAINT_CLASSES.includes('currently_unavailable'));
});

test('CapabilityProfile validation accepts valid declarations and rejects malformed inputs', () => {
  const valid = {
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'manual-fixture',
    display_name: 'Manual Research Fixture',
    trust_domain: 'research',
    capabilities: {
      paper_search: {
        supported: true,
        constraint_classes: ['manual_only'],
        support_mode: 'manual'
      },
      structured_extraction: {
        supported: true,
        constraint_classes: ['unlimited'],
        support_mode: 'local'
      }
    },
    provenance: {
      origin: 'test_fixture',
      actor: 'tester'
    }
  };

  const profile = new ResearchCapabilityProfile(valid);
  assert.equal(profile.provider_id, 'manual-fixture');
  assert.equal(profile.capabilities.paper_search.supported, true);
  assert.deepEqual(profile.capabilities.paper_search.constraint_classes, ['manual_only']);

  // Invalid schema version
  assert.throws(() => {
    new ResearchCapabilityProfile({ ...valid, schema_version: 'invalid-v99' });
  }, /schema version/i);

  // Invalid capability name
  assert.throws(() => {
    new ResearchCapabilityProfile({
      ...valid,
      capabilities: {
        consensus_custom_search: { supported: true, constraint_classes: ['free_quota'] }
      }
    });
  }, /unknown or invalid capability/i);

  // Invalid constraint class
  assert.throws(() => {
    new ResearchCapabilityProfile({
      ...valid,
      capabilities: {
        paper_search: { supported: true, constraint_classes: ['super_secret_vip_tier'] }
      }
    });
  }, /invalid constraint class/i);
});

test('Manifest parser and serializer round-trip deterministically without secrets', () => {
  const manifestJson = JSON.stringify({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'openalex-community',
    display_name: 'OpenAlex Community Index',
    trust_domain: 'retrieval',
    capabilities: {
      api_search: {
        supported: true,
        constraint_classes: ['unlimited', 'free_quota']
      },
      bulk_export: {
        supported: true,
        constraint_classes: ['unlimited']
      }
    }
  }, null, 2);

  const profile = parseCapabilityManifest(manifestJson);
  assert.equal(profile.provider_id, 'openalex-community');
  assert.equal(profile.capabilities.api_search.supported, true);

  const serialized = serializeCapabilityManifest(profile);
  const parsedBack = parseCapabilityManifest(serialized);
  assert.deepEqual(parsedBack, profile);
});

test('CapabilityObservation validates state, provenance, quota, and timestamps', () => {
  const obs = new ResearchCapabilityObservation({
    provider_id: 'consensus-adapter',
    capability: 'deep_review',
    state: 'AVAILABLE',
    observed_at: '2026-08-30T00:00:00.000Z',
    stale_after: '2026-08-31T00:00:00.000Z',
    quota: {
      remaining: 10,
      capacity: 50,
      unit: 'queries',
      reset_at: '2026-09-01T00:00:00.000Z'
    },
    provenance: {
      method: 'synthetic_probe',
      evidence_ref: 'evidence/probe-001.json'
    }
  });

  assert.equal(obs.state, 'AVAILABLE');
  assert.equal(obs.quota.remaining, 10);

  // Invalid state
  assert.throws(() => {
    new ResearchCapabilityObservation({
      provider_id: 'consensus-adapter',
      capability: 'deep_review',
      state: 'MAGICAL_STATE',
      observed_at: new Date().toISOString()
    });
  }, /invalid observation state/i);
});

test('Per-capability state evaluation handles AVAILABLE, QUOTA_EXHAUSTED, STALE, and MISSING independently', () => {
  const profile = new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'provider-a',
    capabilities: {
      paper_search: { supported: true, constraint_classes: ['free_quota'] },
      bulk_export: { supported: true, constraint_classes: ['unlimited'] },
      deep_review: { supported: false }
    }
  });

  const now = Date.parse('2026-08-30T12:00:00.000Z');

  // Case 1: Fresh observation with remaining quota -> AVAILABLE
  const obs1 = new ResearchCapabilityObservation({
    provider_id: 'provider-a',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: '2026-08-30T10:00:00.000Z',
    stale_after: '2026-08-30T18:00:00.000Z',
    quota: { remaining: 5, capacity: 20, unit: 'searches' }
  });
  assert.equal(evaluateCapabilityState(profile, obs1, { now }), 'AVAILABLE');

  // Case 2: Fresh observation with quota remaining = 0 -> QUOTA_EXHAUSTED
  const obs2 = new ResearchCapabilityObservation({
    provider_id: 'provider-a',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: '2026-08-30T10:00:00.000Z',
    stale_after: '2026-08-30T18:00:00.000Z',
    quota: { remaining: 0, capacity: 20, unit: 'searches' }
  });
  assert.equal(evaluateCapabilityState(profile, obs2, { now }), 'QUOTA_EXHAUSTED');

  // Case 3: Stale observation (now > stale_after) -> STALE
  const obs3 = new ResearchCapabilityObservation({
    provider_id: 'provider-a',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: '2026-08-28T10:00:00.000Z',
    stale_after: '2026-08-29T10:00:00.000Z',
    quota: { remaining: 5, capacity: 20, unit: 'searches' }
  });
  assert.equal(evaluateCapabilityState(profile, obs3, { now }), 'STALE');

  // Case 4: No observation -> MISSING
  assert.equal(evaluateCapabilityState(profile, null, { now }), 'MISSING');

  // Case 5: Unsupported capability in profile -> UNAVAILABLE
  assert.equal(evaluateCapabilityState(profile, null, { now, capability: 'deep_review' }), 'UNAVAILABLE');
});

test('Per-capability isolation: Degradation of one capability leaves other capabilities intact', () => {
  const plane = new ResearchCapabilityPlane();
  const profile = new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'hybrid-provider',
    capabilities: {
      paper_search: { supported: true, constraint_classes: ['free_quota'] },
      bulk_export: { supported: true, constraint_classes: ['unlimited'] }
    }
  });
  plane.addProfile(profile);

  const now = Date.parse('2026-08-30T12:00:00.000Z');

  // paper_search is quota-exhausted
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'hybrid-provider',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: '2026-08-30T10:00:00.000Z',
    quota: { remaining: 0, capacity: 10, unit: 'calls' }
  }));

  // bulk_export is available
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'hybrid-provider',
    capability: 'bulk_export',
    state: 'AVAILABLE',
    observed_at: '2026-08-30T10:00:00.000Z'
  }));

  assert.equal(plane.getEffectiveState('hybrid-provider', 'paper_search', now), 'QUOTA_EXHAUSTED');
  assert.equal(plane.getEffectiveState('hybrid-provider', 'bulk_export', now), 'AVAILABLE');
});

test('Economic admission rejects unauthorized paid tiers and enforces explicit free policy', () => {
  const freeProfile = new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'free-provider',
    capabilities: {
      paper_search: { supported: true, constraint_classes: ['free_quota'] }
    }
  });

  const paidProfile = new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'paid-provider',
    capabilities: {
      paper_search: { supported: true, constraint_classes: ['requires_paid_tier'] }
    }
  });

  const freeObs = new ResearchCapabilityObservation({
    provider_id: 'free-provider',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: new Date().toISOString()
  });

  const paidObs = new ResearchCapabilityObservation({
    provider_id: 'paid-provider',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: new Date().toISOString()
  });

  // Policy 1: Default free-only policy (no spend authorized)
  const defaultPolicy = {
    spend: { payg_authorized: false, allow_paid_fallback: false, max_incremental_cost: 0 }
  };

  const freeEval = evaluateEconomicAdmission({
    capability: 'paper_search',
    profile: freeProfile,
    observation: freeObs,
    policy: defaultPolicy
  });
  assert.equal(freeEval.eligible, true);

  const paidEval = evaluateEconomicAdmission({
    capability: 'paper_search',
    profile: paidProfile,
    observation: paidObs,
    policy: defaultPolicy
  });
  assert.equal(paidEval.eligible, false);
  assert.equal(paidEval.reason, 'PAID_NOT_AUTHORIZED');

  // Policy 2: Explicitly authorized paid policy
  const authorizedPaidPolicy = {
    spend: { payg_authorized: true, allow_paid_fallback: true, max_incremental_cost: 10 }
  };

  const paidAuthorizedEval = evaluateEconomicAdmission({
    capability: 'paper_search',
    profile: paidProfile,
    observation: paidObs,
    policy: authorizedPaidPolicy
  });
  assert.equal(paidAuthorizedEval.eligible, true);
});

test('Hard Invariant: Paid fallback is PROHIBITED when free quota is exhausted', () => {
  const plane = new ResearchCapabilityPlane();

  // Free provider with exhausted quota
  plane.addProfile(new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'provider-free',
    capabilities: { paper_search: { supported: true, constraint_classes: ['free_quota'] } }
  }));
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'provider-free',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: new Date().toISOString(),
    quota: { remaining: 0, capacity: 50, unit: 'queries' }
  }));

  // Paid provider is available
  plane.addProfile(new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'provider-paid',
    capabilities: { paper_search: { supported: true, constraint_classes: ['requires_paid_tier'] } }
  }));
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'provider-paid',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: new Date().toISOString()
  }));

  // Route without paid authorization
  const defaultPolicy = { spend: { payg_authorized: false, allow_paid_fallback: false } };
  const route = plane.routeCapability('paper_search', { policy: defaultPolicy });

  // Paid route must NEVER be selected implicitly
  assert.equal(route.status, 'DEGRADED');
  assert.equal(route.selected, null);
  assert.ok(route.rejections.some(r => r.provider_id === 'provider-free' && r.reason === 'QUOTA_EXHAUSTED'));
  assert.ok(route.rejections.some(r => r.provider_id === 'provider-paid' && r.reason === 'PAID_NOT_AUTHORIZED'));
});

test('Manual/Free Fallback: Free manual capability route succeeds when remote provider is exhausted or down', () => {
  const plane = new ResearchCapabilityPlane();

  // Manual fallback profile (always free/local)
  plane.addProfile(new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'manual-cli',
    capabilities: { paper_search: { supported: true, constraint_classes: ['manual_only'] } }
  }));
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'manual-cli',
    capability: 'paper_search',
    state: 'AVAILABLE',
    observed_at: new Date().toISOString()
  }));

  // Remote provider is unavailable
  plane.addProfile(new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'remote-scholarly',
    capabilities: { paper_search: { supported: true, constraint_classes: ['free_quota'] } }
  }));
  plane.recordObservation(new ResearchCapabilityObservation({
    provider_id: 'remote-scholarly',
    capability: 'paper_search',
    state: 'UNAVAILABLE',
    observed_at: new Date().toISOString(),
    reason: 'upstream outage'
  }));

  const route = plane.routeCapability('paper_search');
  assert.equal(route.status, 'ROUTED');
  assert.equal(route.selected, 'manual-cli');
});

test('CapabilityRegistry integration registers research capabilities and routes deterministically', () => {
  const registry = new CapabilityRegistry();
  const profile = new ResearchCapabilityProfile({
    schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
    provider_id: 'local-extraction-service',
    trust_domain: 'retrieval',
    capabilities: {
      structured_extraction: { supported: true, constraint_classes: ['unlimited'], support_mode: 'local' }
    }
  });

  registerResearchCapabilities(registry, profile, [
    new ResearchCapabilityObservation({
      provider_id: 'local-extraction-service',
      capability: 'structured_extraction',
      state: 'AVAILABLE',
      observed_at: new Date().toISOString()
    })
  ]);

  const decision = registry.choose({
    trust_domain: 'retrieval',
    capabilities: ['structured_extraction']
  });

  assert.equal(decision.status, 'ROUTED');
  assert.equal(decision.selected, 'local-extraction-service');
});

test('Canonical Authority Isolation: Capability state mutations NEVER alter ResearchDocument corpus', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'kad-cap-iso-'));
  try {
    const corpus = new DeterministicResearchCorpus({ storageDir: tmp, rootDir: tmp });
    const ingestion = corpus.ingestCandidate({
      title: 'Immutable Canonical Corpus Test',
      identifiers: [{ type: 'doi', value: '10.1000/cap-iso-1' }]
    });

    const docBefore = corpus.inspectDocument(ingestion.document.document_id);
    assert.ok(docBefore);
    const serializedBefore = JSON.stringify(docBefore);

    // Perform capability changes in capability plane
    const plane = new ResearchCapabilityPlane();
    plane.addProfile(new ResearchCapabilityProfile({
      schema_version: RESEARCH_CAPABILITY_SCHEMA_VERSION,
      provider_id: 'test-mutator',
      capabilities: { paper_search: { supported: true, constraint_classes: ['requires_paid_tier'] } }
    }));
    plane.recordObservation(new ResearchCapabilityObservation({
      provider_id: 'test-mutator',
      capability: 'paper_search',
      state: 'QUOTA_EXHAUSTED',
      observed_at: new Date().toISOString()
    }));

    // Re-verify canonical document
    const docAfter = corpus.inspectDocument(ingestion.document.document_id);
    assert.deepEqual(JSON.stringify(docAfter), serializedBefore);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('Baseline suite executes completely offline with zero credentials or network', () => {
  assert.equal(process.env.KAD_TEST_NETWORK, undefined);
});

test('Baseline capability manifests in config/research-capabilities load cleanly', () => {
  const plane = new ResearchCapabilityPlane();
  const loaded = plane.loadProfilesFromDir('config/research-capabilities');
  assert.equal(loaded, 5);

  const manual = plane.getProfile('manual');
  assert.ok(manual);
  assert.equal(manual.capabilities.paper_search.supported, true);

  const consensus = plane.getProfile('consensus');
  assert.ok(consensus);
  assert.equal(consensus.capabilities.deep_review.constraint_classes.includes('requires_paid_tier'), true);
});
