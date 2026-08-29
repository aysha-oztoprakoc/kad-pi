import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const STATES = new Set(['PROPOSED', 'READY', 'CLAIMED', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'ACCEPTED', 'REJECTED', 'SUPERSEDED']);
const MUTATING_STATES = new Set(['CLAIMED', 'IN_PROGRESS']);

function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temp, file);
}
function output(value) { return JSON.stringify(value, null, 2); }
function fail(message) { return { code: 1, error: message }; }
function ok(value) { return { code: 0, value }; }
function workspaceRoot(start = process.cwd()) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, '.agents', 'workspace', 'projects.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error('workspace registry not found');
    current = parent;
  }
}
function paths(root) {
  const work = path.join(root, '.agents', 'work');
  return { work, claims: path.join(work, 'claims'), reviews: path.join(work, 'reviews'), handoffs: path.join(work, 'handoffs') };
}
function registry(root) { return json(path.join(root, '.agents', 'workspace', 'projects.json')); }
function toolRegistry(root) {
  const file = path.join(root, '.agents', 'workspace', 'tools.json');
  return fs.existsSync(file) ? json(file) : { version: 1, tools: [] };
}
function skillIssues(root) {
  const directory = path.join(root, '.agents', 'skills');
  if (!fs.existsSync(directory)) return ['canonical skill root missing'];
  const issues = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(directory, entry.name, 'SKILL.md');
    if (!fs.existsSync(file)) { issues.push(`${entry.name}: SKILL.md missing`); continue; }
    const content = fs.readFileSync(file, 'utf8');
    const normalized = content.replaceAll('\r\n', '\n');
    const frontmatter = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (!frontmatter) { issues.push(`${entry.name}: frontmatter missing`); continue; }
    const name = frontmatter[1].match(/^name:\s*([^\s#]+)\s*$/m)?.[1];
    const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1];
    if (name !== entry.name) issues.push(`${entry.name}: frontmatter name mismatch`);
    if (!description) issues.push(`${entry.name}: description missing`);
  }
  return issues;
}
function project(root, id) {
  const match = registry(root).projects.find((entry) => entry.id === id);
  if (!match) throw new Error(`unknown project: ${id}`);
  return { ...match, root: path.resolve(root, match.path) };
}
function gitHead(projectRoot) {
  const result = spawnSync('git', ['-C', projectRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
function workFiles(root) {
  const { work } = paths(root);
  if (!fs.existsSync(work)) return [];
  const found = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'claims' || entry.name === 'handoffs' || entry.name === 'reviews') continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) found.push(full);
    }
  };
  walk(work);
  return found.sort();
}
function workItems(root) { return workFiles(root).map((file) => ({ ...json(file), _file: file })); }
function task(root, id) {
  const item = workItems(root).find((candidate) => candidate.id === id || candidate._file === path.resolve(id));
  if (!item) throw new Error(`unknown task: ${id}`);
  return item;
}
function dependenciesResolved(root, item) {
  const byId = new Map(workItems(root).map((candidate) => [candidate.id, candidate]));
  return (item.blocked_by ?? []).every((id) => byId.get(id)?.status === 'ACCEPTED');
}
function isClaimableItem(root, item) {
  try { return ['PRIMARY', 'SIDE_PROJECT'].includes(project(root, item.project).kind); } catch { return false; }
}
function relativeOwned(projectRoot, ownedPath) {
  if (typeof ownedPath !== 'string' || path.isAbsolute(ownedPath)) throw new Error(`owned path must be relative: ${ownedPath}`);
  const resolved = path.resolve(projectRoot, ownedPath);
  const relative = path.relative(projectRoot, resolved);
  if (relative.startsWith(`..${path.sep}`) || relative === '..') throw new Error(`owned path escapes project: ${ownedPath}`);
  return relative.split(path.sep).join('/');
}
function validateItem(root, item) {
  for (const field of ['id', 'project', 'title', 'status', 'fixed_point', 'owned_paths', 'blocked_by', 'blocks']) {
    if (!(field in item)) throw new Error(`task ${item.id ?? '<unknown>'} missing ${field}`);
  }
  if (!STATES.has(item.status)) throw new Error(`task ${item.id} has invalid state ${item.status}`);
  const currentProject = project(root, item.project);
  if (!Array.isArray(item.owned_paths)) throw new Error(`task ${item.id} owned_paths must be an array`);
  if (!Array.isArray(item.blocked_by) || !Array.isArray(item.blocks)) throw new Error(`task ${item.id} dependency fields must be arrays`);
  for (const ownedPath of item.owned_paths) relativeOwned(currentProject.root, ownedPath);
  if (!Array.isArray(item.required_capabilities)) throw new Error(`task ${item.id} required_capabilities must be an array`);
  if (!dependenciesResolved(root, item) && ['READY', 'CLAIMED', 'IN_PROGRESS'].includes(item.status)) throw new Error(`task ${item.id} has unresolved blockers`);
  return currentProject;
}
function claimFiles(root) {
  const { claims } = paths(root);
  if (!fs.existsSync(claims)) return [];
  return fs.readdirSync(claims).filter((name) => name.endsWith('.json')).sort().map((name) => path.join(claims, name));
}
function activeClaims(root) {
  return claimFiles(root).map((file) => ({ ...json(file), _file: file })).filter((claim) => claim.active !== false && claim.mode !== 'readonly');
}
function pathConflict(left, right) {
  const normalizedLeft = String(left).replaceAll('\\', '/').replace(/\/+$/, '');
  const normalizedRight = String(right).replaceAll('\\', '/').replace(/\/+$/, '');
  return normalizedLeft === normalizedRight || normalizedLeft.startsWith(`${normalizedRight}/`) || normalizedRight.startsWith(`${normalizedLeft}/`);
}
function staleClaim(root, claim) {
  const item = workItems(root).find((candidate) => candidate.id === claim.task);
  if (!item || !MUTATING_STATES.has(item.status)) return true;
  const projectInfo = project(root, item.project);
  const currentHead = gitHead(projectInfo.root);
  return claim.base_commit !== item.fixed_point || (currentHead !== null && currentHead !== item.fixed_point);
}
function withClaimLock(root, callback) {
  const lock = path.join(paths(root).work, '.claim.lock');
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  let fd;
  try { fd = fs.openSync(lock, 'wx'); } catch { throw new Error('claim operation already in progress'); }
  try { return callback(); } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
function actor(args) { return args.actor ?? process.env.WORKCTL_ACTOR ?? 'unknown-actor'; }
function actorFile(args) {
  const label = actor(args);
  if (!/^[A-Za-z0-9._-]+$/.test(label)) throw new Error('actor label contains unsafe path characters');
  return label;
}
function option(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}
function parse(argv) {
  const args = [...argv];
  const command = args.shift() ?? 'help';
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index].startsWith('--')) index += 1;
    else positional.push(args[index]);
  }
  return { command, args, positional, project: option(args, '--project'), actor: option(args, '--actor'), mode: option(args, '--mode', 'mutate') };
}
function dirtyPaths(projectRoot) {
  const result = spawnSync('git', ['-C', projectRoot, 'status', '--short', '--untracked-files=all'], { encoding: 'utf8' });
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean).map((line) => line.slice(3).trim()).filter(Boolean);
}
function instructionFiles(root, currentProject) {
  const files = [];
  const candidate = currentProject.instruction_entrypoint;
  if (candidate && fs.existsSync(path.join(currentProject.root, candidate))) files.push(path.relative(root, path.join(currentProject.root, candidate)) || candidate);
  if (currentProject.root !== root && fs.existsSync(path.join(root, 'AGENTS.md'))) files.push('AGENTS.md');
  return [...new Set(files)];
}
function markdownHandoff(item, claim, handoff, projectInfo) {
  return `# Handoff: ${item.id}\n\n- Project: ${item.project}\n- Title: ${item.title}\n- Fixed point: ${item.fixed_point}\n- Current HEAD: ${handoff.current_head ?? 'unknown'}\n- Owner: ${claim?.actor_label ?? 'unclaimed'}\n- Mode: ${claim?.mode ?? 'unknown'}\n\n## Scope\n\n- Owned paths: ${item.owned_paths.join(', ') || 'none'}\n- Scope: ${(item.scope ?? []).join(', ') || 'none'}\n- Non-scope: ${(item.non_scope ?? []).join(', ') || 'none'}\n\n## State\n\n- Status: ${item.status}\n- Completed: ${(handoff.completed ?? []).join('; ') || 'none recorded'}\n- Remaining: ${(handoff.remaining ?? ['Continue from the task contract']).join('; ')}\n- Dirty owned paths: ${(handoff.dirty_owned_paths ?? []).join(', ') || 'none'}\n\n## Validation and evidence\n\n- Tests run: ${(handoff.tests_run ?? []).join('; ') || 'none recorded'}\n- Tests pending: ${(handoff.tests_pending ?? item.validation ?? []).join('; ') || 'none recorded'}\n- Failures: ${(handoff.failures ?? []).join('; ') || 'none recorded'}\n- Blockers: ${(handoff.blockers ?? []).join('; ') || 'none recorded'}\n- Evidence: ${(item.evidence_target ?? 'none specified')}\n\n## Next deterministic action\n\n${handoff.next_action ?? 'Read project instructions, inspect the fixed point, then follow the task validation list.'}\n`;
}
function execute(root, parsed) {
  const { command, positional } = parsed;
  if (command === 'bootstrap') {
    const locations = paths(root); Object.values(locations).forEach((directory) => fs.mkdirSync(directory, { recursive: true }));
    return ok({ workspace: root, registry: true, bootstrapped: true, llm_required: false });
  }
  if (command === 'projects') return ok(registry(root));
  if (command === 'status') {
    const claims = new Map(activeClaims(root).map((claim) => [claim.task, claim]));
    return ok(workItems(root).map(({ _file, ...item }) => ({ ...item, claim: claims.get(item.id) ?? null })));
  }
  if (command === 'next') {
    const candidates = workItems(root).filter((item) => item.status === 'READY' && dependenciesResolved(root, item) && isClaimableItem(root, item) && (!parsed.project || item.project === parsed.project));
    candidates.sort((a, b) => (Number(b.priority ?? 0) - Number(a.priority ?? 0)) || a.id.localeCompare(b.id));
    if (!candidates[0]) return ok(null);
    const { _file, ...result } = candidates[0]; return ok(result);
  }
  if (command === 'show') { const { _file, ...result } = task(root, positional[0]); return ok(result); }
  if (command === 'claim') {
    const item = task(root, positional[0]);
    const projectInfo = validateItem(root, item);
    if (!['mutate', 'readonly'].includes(parsed.mode)) return fail('mode must be mutate or readonly');
    if (parsed.mode === 'mutate' && !['PRIMARY', 'SIDE_PROJECT'].includes(projectInfo.kind)) return fail(`project is not claimable: ${projectInfo.id}`);
    if (parsed.mode === 'mutate' && !['READY', ...MUTATING_STATES].includes(item.status)) return fail(`task is not claimable in state ${item.status}`);
    if (parsed.mode === 'mutate' && !dependenciesResolved(root, item)) return fail('task has unresolved blockers');
    if (parsed.mode === 'readonly') {
      const review = { task: item.id, project: item.project, actor_label: actor(parsed), mode: 'readonly', started_at: new Date().toISOString(), fixed_point: item.fixed_point };
      writeJson(path.join(paths(root).reviews, item.id, `${actorFile(parsed)}.json`), review);
      return ok(review);
    }
    try {
      return ok(withClaimLock(root, () => {
        const existing = activeClaims(root).find((claim) => claim.task === item.id);
        if (existing) throw new Error('task already claimed');
        const currentHead = gitHead(projectInfo.root);
        if (currentHead && item.fixed_point !== currentHead) throw new Error(`fixed point mismatch: expected ${item.fixed_point}, current ${currentHead}`);
        const owned = [...new Set(item.owned_paths.map((ownedPath) => relativeOwned(projectInfo.root, ownedPath)))];
        for (const claim of activeClaims(root).filter((candidate) => candidate.project === item.project)) {
          if ((claim.owned_paths ?? []).some((ownedPath) => owned.some((candidatePath) => pathConflict(ownedPath, candidatePath)))) throw new Error('owned paths already claimed');
        }
        const record = { task: item.id, project: item.project, claim_id: crypto.randomUUID(), actor_label: actor(parsed), started_at: new Date().toISOString(), base_commit: currentHead ?? item.fixed_point, owned_paths: [...owned], mode: 'mutate', active: true };
        const claimFile = path.join(paths(root).claims, `${item.id}.json`);
        fs.mkdirSync(path.dirname(claimFile), { recursive: true });
        const fd = fs.openSync(claimFile, 'wx'); fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`); fs.closeSync(fd);
        item.status = 'CLAIMED'; writeJson(item._file, Object.fromEntries(Object.entries(item).filter(([key]) => key !== '_file')));
        return record;
      }));
    } catch (error) { return fail(error.message); }
  }
  if (command === 'release') {
    const item = task(root, positional[0]);
    if (!MUTATING_STATES.has(item.status)) return fail(`task is not releasable in state ${item.status}`);
    const claimFile = path.join(paths(root).claims, `${item.id}.json`);
    if (!fs.existsSync(claimFile)) return fail('task has no active claim');
    const claim = json(claimFile);
    if (claim.active === false) return fail('task has no active claim');
    if (claim.actor_label !== actor(parsed)) return fail('only the claim owner may release the task');
    claim.active = false; claim.released_at = new Date().toISOString(); writeJson(claimFile, claim);
    item.status = 'READY'; writeJson(item._file, Object.fromEntries(Object.entries(item).filter(([key]) => key !== '_file')));
    return ok(claim);
  }
  if (command === 'transition') {
    const item = task(root, positional[0]); const nextState = positional[1];
    if (!STATES.has(nextState)) return fail(`invalid state ${nextState}`);
    const transitions = { PROPOSED: ['READY'], READY: ['SUPERSEDED'], CLAIMED: ['IN_PROGRESS', 'BLOCKED', 'REVIEW', 'SUPERSEDED'], IN_PROGRESS: ['BLOCKED', 'REVIEW', 'SUPERSEDED'], BLOCKED: ['READY', 'SUPERSEDED'], REVIEW: ['ACCEPTED', 'REJECTED', 'SUPERSEDED'], ACCEPTED: [], REJECTED: [], SUPERSEDED: [] };
    if (!transitions[item.status]?.includes(nextState)) return fail(`invalid transition ${item.status} -> ${nextState}`);
    const claimFile = path.join(paths(root).claims, `${item.id}.json`);
    const claim = fs.existsSync(claimFile) ? json(claimFile) : null;
    if (nextState !== 'READY' && (!claim || claim.actor_label !== actor(parsed))) return fail('claim owner required for transition');
    if (claim && !MUTATING_STATES.has(nextState)) {
      claim.active = false; claim.released_at = new Date().toISOString(); writeJson(claimFile, claim);
    }
    item.status = nextState; writeJson(item._file, Object.fromEntries(Object.entries(item).filter(([key]) => key !== '_file')));
    return ok({ task: item.id, status: nextState });
  }
  if (command === 'handoff') {
    const item = task(root, positional[0]); const projectInfo = validateItem(root, item);
    const claimFile = path.join(paths(root).claims, `${item.id}.json`);
    const claim = fs.existsSync(claimFile) ? json(claimFile) : null;
    if (!claim || claim.active === false || claim.mode === 'readonly') return fail('active mutating claim required for handoff');
    if (claim.actor_label !== actor(parsed)) return fail('only the claim owner may hand off the task');
    const dirty = dirtyPaths(projectInfo.root);
    const dirtyOwnedPaths = dirty.filter((entry) => item.owned_paths.some((ownedPath) => pathConflict(entry, ownedPath) || pathConflict(ownedPath, entry)));
    const handoff = { task: item.id, project: item.project, spec: item.spec_ref ?? null, fixed_point: item.fixed_point, current_head: gitHead(projectInfo.root), scope: item.scope ?? [], non_scope: item.non_scope ?? [], owned_paths: item.owned_paths, completed: [], remaining: ['Continue from the task contract'], tests_run: [], tests_pending: item.validation ?? [], failures: [], blockers: [], evidence_paths: item.evidence_target ? [item.evidence_target] : [], dirty_paths: dirty, dirty_owned_paths: dirtyOwnedPaths, next_action: 'Read project instructions, inspect the fixed point, then follow the task validation list.', instruction_files: instructionFiles(root, projectInfo) };
    const directory = paths(root).handoffs; writeJson(path.join(directory, `${item.id}.json`), handoff); fs.writeFileSync(path.join(directory, `${item.id}.md`), markdownHandoff(item, claim, handoff, projectInfo));
    return ok({ json: path.relative(root, path.join(directory, `${item.id}.json`)), markdown: path.relative(root, path.join(directory, `${item.id}.md`)), ...handoff });
  }
  if (command === 'resume') {
    const item = task(root, positional[0]); const projectInfo = validateItem(root, item); const handoffFile = path.join(paths(root).handoffs, `${item.id}.json`);
    if (!fs.existsSync(handoffFile)) return fail('no handoff exists for task');
    return ok({ project: { ...projectInfo, root: undefined }, instructions: instructionFiles(root, projectInfo), task: Object.fromEntries(Object.entries(item).filter(([key]) => key !== '_file')), handoff: json(handoffFile), validation: item.validation ?? [] });
  }
  if (command === 'skills') {
    const subcommand = positional[0] ?? 'status';
    const skillRoots = ['.agents/skills', '.claude/skills', 'agent/skills'].map((relative) => path.join(root, relative)).filter((directory) => fs.existsSync(directory));
    const names = new Map();
    for (const skillRoot of skillRoots) for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) if (entry.isDirectory() && fs.existsSync(path.join(skillRoot, entry.name, 'SKILL.md'))) names.set(entry.name, [...(names.get(entry.name) ?? []), path.relative(root, skillRoot)]);
    const collisions = [...names.entries()].filter(([, locations]) => locations.length > 1).map(([name, locations]) => ({ name, locations, canonical: '.agents/skills', resolution: 'canonical root wins; legacy views remain read-only' }));
    const issues = skillIssues(root);
    if (subcommand === 'check-updates') return ok({ status: 'deferred', reason: 'normal coordination does not auto-update trusted instructions', collisions, issues });
    return ok({ canonical_root: '.agents/skills', roots: skillRoots.map((directory) => path.relative(root, directory)), skills: [...names.entries()].sort().map(([name, locations]) => ({ name, locations })), collisions, issues, llm_required: false });
  }
  if (command === 'doctor') {
    const errors = []; const warnings = []; let data;
    try { data = registry(root); if (!Array.isArray(data.projects)) errors.push('registry projects must be an array'); } catch (error) { errors.push(`registry: ${error.message}`); }
    for (const claim of activeClaims(root)) if (staleClaim(root, claim)) warnings.push(`STALE_CANDIDATE: ${claim.task}`);
    for (const item of workItems(root)) try { validateItem(root, item); } catch (error) { errors.push(error.message); }
    const skillResult = execute(root, { command: 'skills', positional: ['status'], args: [], project: null });
    if (skillResult.value.issues.length) {
      for (const issue of skillResult.value.issues) {
        const owned = issue.startsWith('workspace-');
        (owned ? errors : warnings).push(`skill: ${issue}`);
      }
    }
    const tools = toolRegistry(root).tools ?? []; const toolStatus = tools.map((tool) => { const executable = String(tool.command).trim().split(/\s+/)[0]; const local = executable.startsWith('.') || executable.includes('/'); const available = local ? fs.existsSync(path.resolve(root, executable)) : spawnSync('sh', ['-c', 'command -v "$1"', 'workctl', executable]).status === 0; return { id: tool.id, command: tool.command, available }; });
    return errors.length ? fail(JSON.stringify({ errors, warnings, toolStatus })) : ok({ status: 'healthy', errors, warnings, toolStatus, llm_required: false });
  }
  return ok({ commands: ['bootstrap', 'projects', 'status', 'next', 'show', 'claim', 'release', 'transition', 'handoff', 'resume', 'skills status', 'skills check-updates', 'doctor'] });
}

export function runWorkctl(argv, options = {}) {
  try {
    const root = options.workspaceRoot ? path.resolve(options.workspaceRoot) : workspaceRoot();
    const result = execute(root, parse(argv));
    return result;
  } catch (error) { return fail(error.message); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runWorkctl(process.argv.slice(2));
  process.stdout.write(`${result.code === 0 ? output(result.value) : result.error}\n`);
  process.exitCode = result.code;
}
