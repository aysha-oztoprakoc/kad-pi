/**
 * TELL Headless Server Host Capability Adapter
 * Host: host.tell.server (ISA-KAD-COMPUTE-FABRIC-001 Section 5)
 *
 * Invariants:
 * 1. Isolates NixOS-specific package managers and system paths from cognition policy.
 * 2. Maps hardware capabilities (CPU, RAM, accelerators) into canonical STC capability contracts.
 * 3. Proposes capabilities; has zero authority to mutate production routing or canonical vault state.
 */

export const HOST_CAPABILITY_SCHEMA = 'kad-compute-host-capability-v1';

export function createTellHostCapabilityDescriptor(rawHardware = {}) {
  const cores = Number(rawHardware.cpuCores) || 8;
  const totalRamGb = rawHardware.totalRamBytes
    ? Math.round(rawHardware.totalRamBytes / (1024 ** 3))
    : 32;

  // Standardized capability classes supported by TELL server
  const supportedClasses = [
    'deterministic_transformation',
    'classification_extraction',
    'retrieval_ranking',
    'summarization'
  ];

  if (totalRamGb >= 64) {
    supportedClasses.push('structured_generation');
  }

  return {
    schema: HOST_CAPABILITY_SCHEMA,
    host: 'host.tell.server',
    node_type: 'HEADLESS_COMPUTE_NODE',
    trust_domain: 'engineering',
    hardware: {
      architecture: rawHardware.arch || 'x86_64',
      logical_cores: cores,
      system_ram_gb: totalRamGb,
      accelerator_type: rawHardware.accelerator ? 'cpu_accelerated' : 'cpu_standard'
    },
    supported_cognition_classes: supportedClasses,
    max_context_tokens: totalRamGb >= 64 ? 32768 : 16384,
    execution_latency_overhead_ms: 0,
    authority_grant: false,
    routing_mutation_allowed: false,
    vault_mutation_allowed: false,
    generated_at: new Date().toISOString()
  };
}

export function validateHostCapabilityDescriptor(descriptor) {
  if (!descriptor || descriptor.schema !== HOST_CAPABILITY_SCHEMA) {
    return { valid: false, reason: 'INVALID_SCHEMA' };
  }

  // Check for leaked OS/system paths
  const serialized = JSON.stringify(descriptor);
  const leakedPaths = ['/nix/store', '/nix/var', 'nixos-rebuild', 'nix-shell'].filter(p => serialized.includes(p));

  return {
    valid: leakedPaths.length === 0,
    hasLeakedSystemPaths: leakedPaths.length > 0,
    leakedPaths,
    host: descriptor.host,
    supportedClassesCount: descriptor.supported_cognition_classes?.length || 0
  };
}
