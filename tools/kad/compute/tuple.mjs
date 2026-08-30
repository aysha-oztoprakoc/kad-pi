/**
 * 9-Tuple Experimental Configuration Module
 * Authority: ISA-KAD-COMPUTE-FABRIC-001 Section 3.2 & D021-004
 *
 * Tuple = (model x quant x runtime x devices x context x KV x speculation x threading x network)
 */

export const EXPERIMENT_TUPLE_SCHEMA = 'kad-compute-experiment-tuple-v1';

export const TUPLE_DIMENSIONS = Object.freeze([
  'model',
  'quant',
  'runtime',
  'devices',
  'context',
  'KV',
  'speculation',
  'threading',
  'network'
]);

export function createExperimentTuple(config = {}) {
  return {
    schema: EXPERIMENT_TUPLE_SCHEMA,
    model: config.model || null,
    quant: config.quant || null,
    runtime: config.runtime || null,
    devices: config.devices || null,
    context: typeof config.context === 'number' ? config.context : (Number(config.context) || null),
    KV: config.KV || null,
    speculation: config.speculation || 'none',
    threading: config.threading || 'auto',
    network: config.network || 'local_memory'
  };
}

export function validateExperimentTuple(tuple) {
  if (!tuple || tuple.schema !== EXPERIMENT_TUPLE_SCHEMA) {
    return { valid: false, reason: 'INVALID_SCHEMA' };
  }

  const missingDimensions = [];
  for (const dim of TUPLE_DIMENSIONS) {
    const val = tuple[dim];
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      missingDimensions.push(dim);
    }
  }

  return {
    valid: missingDimensions.length === 0,
    missingDimensions
  };
}

export function serializeTupleKey(tuple) {
  const parts = TUPLE_DIMENSIONS.map(dim => String(tuple[dim] ?? 'null'));
  return parts.join(':');
}
