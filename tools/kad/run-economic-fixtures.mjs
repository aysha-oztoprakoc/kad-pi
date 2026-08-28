#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createEconomicPolicy, routeEconomically } from './economic-router.mjs';
const root = resolve(process.cwd());
const dir = join(root, 'evidence', 'WP-KAD-TOKENMAX-001');
const fixtures = JSON.parse(readFileSync(join(dir, 'routing-fixtures.json'), 'utf8'));
const policy = createEconomicPolicy(JSON.parse(readFileSync(join(dir, 'economic-policy.json'), 'utf8')));
const rows = fixtures.cases.map(fixture => {
  const started = performance.now();
  const route = routeEconomically({ requirement: fixtures.requirement, lanes: fixture.lanes, queued_work: fixture.queued_work === true, policy, now: fixtures.now });
  return { fixture_id: fixture.id, route, economic_route_ms: Number((performance.now() - started).toFixed(3)) };
});
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'routing-results.jsonl'), rows.map(row => JSON.stringify(row)).join('\n') + '\n');
console.log(JSON.stringify({ cases: rows.length, selected: rows.map(row => [row.fixture_id, row.route.selected_lane ?? null]) }));
