#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const PUBLICATION_SCHEMA_VERSION = 'kad-public-state-v1';
const STATUS_STATES = Object.freeze(['PASS', 'QUALIFIED', 'PARTIAL', 'DEGRADED', 'BLOCKED', 'FAILED', 'UNKNOWN', 'EXPERIMENTAL', 'FILE_ONLY', 'LOADABLE', 'ACTIVE', 'STALE', 'QUARANTINED']);
const SAFE_RECORD_FIELDS = Object.freeze(['id', 'title', 'namespace', 'status', 'description', 'epistemic_class', 'acceptance_state']);
const SECRET_KEY = /\b(?:password|passwd|secret|token|credential|prompt|trace|source_ref|source_hash|local_path|absolute_path)\b|(?:api[_-]?key|private[_-]?key)/i;
const PRIVATE_VALUE = /^(?:\/|file:\/\/)|(?:bearer\s+|sk-[a-z0-9]{16,})/i;

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} is required`);
}

function validStatus(value) {
  return STATUS_STATES.includes(value) ? value : 'UNKNOWN';
}

function countStatuses(components) {
  const counts = Object.fromEntries(STATUS_STATES.map(status => [status, 0]));
  for (const component of components) counts[validStatus(component.state)] += 1;
  return counts;
}

function sanitizeRecord(record) {
  if (record?.privacy_class !== 'PUBLIC') return null;
  const output = {};
  for (const field of SAFE_RECORD_FIELDS) if (record[field] !== undefined) output[field] = record[field];
  return output.id && output.title ? output : null;
}

export function sanitizePublicProjection(internal) {
  assertObject(internal, 'internal projection');
  const statusProjection = internal.status_projection ?? {};
  const components = Array.isArray(statusProjection.components) ? statusProjection.components : [];
  const records = Array.isArray(internal.records) ? internal.records.map(sanitizeRecord).filter(Boolean) : [];
  const output = {
    schema_version: PUBLICATION_SCHEMA_VERSION,
    publication_class: 'PUBLIC',
    projection_id: String(internal.projection_id ?? 'unknown'),
    project: {
      name: 'KAD-PI',
      status: validStatus(statusProjection.status ?? internal.status),
      source_count: Number.isInteger(internal.source_count) ? internal.source_count : 0,
      record_count: Number.isInteger(internal.record_count) ? internal.record_count : 0
    },
    component_summary: countStatuses(components),
    records
  };
  validatePublicProjection(output);
  return output;
}

export function validatePublicProjection(publicProjection) {
  assertObject(publicProjection, 'public projection');
  if (publicProjection.publication_class !== 'PUBLIC') throw new Error('publication boundary rejects non-PUBLIC output');
  if (publicProjection.schema_version !== PUBLICATION_SCHEMA_VERSION) throw new Error('publication boundary rejects unknown schema');
  if (!publicProjection.project || validStatus(publicProjection.project.status) !== publicProjection.project.status) throw new Error('publication boundary rejects invalid project status');
  if (!Array.isArray(publicProjection.records)) throw new Error('publication boundary rejects invalid records');
  for (const record of publicProjection.records) {
    if (!record || typeof record !== 'object' || !record.id || !record.title) throw new Error('publication boundary rejects malformed record');
    if (Object.keys(record).some(key => !SAFE_RECORD_FIELDS.includes(key))) throw new Error('publication boundary rejects private record field');
    if (Object.keys(record).some(key => SECRET_KEY.test(key))) throw new Error('publication boundary rejects secret-shaped field');
    if (Object.values(record).some(value => typeof value === 'string' && PRIVATE_VALUE.test(value))) throw new Error('publication boundary rejects private value');
  }
  return true;
}

export function buildPublicProjection({ rootDir = process.cwd(), inputDir = join(rootDir, 'wiki', 'generated', 'kad-canonical'), outputFile = join(rootDir, 'site', 'generated', 'public-state.json') } = {}) {
  const statePath = join(inputDir, 'project-state.json');
  const statusPath = join(inputDir, 'status.json');
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const statusProjection = JSON.parse(readFileSync(statusPath, 'utf8'));
  const output = sanitizePublicProjection({ ...state, status_projection: statusProjection });
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
  return { ...output, output_file: outputFile };
}

export function runPublicationCli(args, { rootDir = resolve(dirname(new URL(import.meta.url).pathname), '../..'), stdout = console.log, stderr = console.error } = {}) {
  const [command] = args;
  if (command !== 'build') {
    stderr('usage: kad-publication build');
    return 2;
  }
  try {
    const result = buildPublicProjection({ rootDir });
    stdout(JSON.stringify({ status: 'PASS', schema_version: result.schema_version, output_file: relative(rootDir, result.output_file), records: result.records.length }, null, 2));
    return 0;
  } catch (error) {
    stderr(error.message);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) process.exitCode = runPublicationCli(process.argv.slice(2));
