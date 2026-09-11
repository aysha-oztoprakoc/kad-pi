import { compileProjections } from './projection.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const AUTHORITY = Object.freeze({ CANONICAL:'CANONICAL', RAW_EVIDENCE:'RAW_EVIDENCE', PROPOSAL:'PROPOSAL', DERIVED:'DERIVED', EXTERNAL_AUTHORITY_REFERENCE:'EXTERNAL_AUTHORITY_REFERENCE', ARCHIVED:'ARCHIVED', UNKNOWN:'UNKNOWN', CANONICAL_KNOWLEDGE:'CANONICAL_KNOWLEDGE', CANONICAL_PROJECT_DECISION:'CANONICAL_PROJECT_DECISION', PROPOSAL_UNREVIEWED:'PROPOSAL_UNREVIEWED' });
export const EPISTEMIC = Object.freeze({ SOURCE_FACT:'SOURCE_FACT', DERIVED_SYNTHESIS:'DERIVED_SYNTHESIS', PROJECT_INFERENCE:'PROJECT_INFERENCE', UNKNOWN:'UNKNOWN' });
export const VAULT_ZONES = Object.freeze(['00_Home','00_Governance','10_Inbox','10_Raw','20_Sources','20_Sources/Papers','20_Sources/Documentation','20_Sources/Web','20_Sources/Transcripts','20_Sources/Assets','30_Knowledge','30_Knowledge/Concepts','30_Knowledge/Technologies','30_Knowledge/Models','30_Knowledge/Systems','30_Knowledge/People','30_Knowledge/Organizations','40_Decisions','40_Research/Papers','40_Research/Questions','40_Research/Syntheses','40_Research/Claims','40_Research/Experiments','50_Projects/KAD-PI/Overview','50_Projects/KAD-PI/Architecture','50_Projects/KAD-PI/Roadmap','50_Projects/KAD-PI/Workpackages','50_Projects/KAD-PI/Decisions','50_Projects/KAD-PI/Experiments','50_Projects/KAD-PI/Releases','60_Operations/Machines','60_Operations/Models','60_Operations/Providers','60_Operations/Harnesses','60_Operations/Resources','60_Operations/Metrics','70_Dashboards','80_Review/Pending','80_Review/Rejected','80_Review/Receipts','90_Derived/Indexes','90_Derived/ContextPacks','90_Derived/KnowledgePlane','90_Derived/Sofia','90_Derived/Website','99_Archive']);
/**
 * Declared zones the vault does not govern as canon: governance records, raw
 * ingest, review queues, derived projections and the archive are addressable but
 * exempt from the `kad_id` rule.
 */
export const NON_CANONICAL_ZONES = Object.freeze(['00_Governance','10_Raw','80_Review','90_Derived','99_Archive']);
const RESERVED_NAMES = Object.freeze(['index.md','log.md','bootstrap.md','_meta.md']);
/**
 * Top-level areas the layout declares.
 *
 * The vault owns the zones it declares. Everything else in the same tree — the
 * memory substrate's episodic capture under `sessions/`, its monthly ledgers,
 * whatever directory the substrate adds next — is written by processes the vault
 * does not control, so a canon rule there is unsatisfiable by editing the corpus.
 * Those paths are reported (`OUTSIDE_DECLARED_ZONE`) rather than enforced.
 */
const zoneTops = new Set(VAULT_ZONES.map((zone) => zone.split('/')[0]));
export const inCanonScope = (relative) => zoneTops.has(String(relative).split('/')[0]);
export const inNonCanonicalZone = (relative) => NON_CANONICAL_ZONES.some((zone) => String(relative) === zone || String(relative).startsWith(`${zone}/`));
export const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
export const stableKadId = (identity) => `kad-${sha256(String(identity)).slice(0, 24)}`;
const safe = (root, candidate) => { const r=path.resolve(root), c=path.resolve(candidate); if (c!==r && !c.startsWith(`${r}${path.sep}`)) throw new Error('path escapes vault'); return c; };
const RECORD_POINTER_RELPATH = path.join('.ai-memory', 'vault-path');

/** Walks up from `start` looking for the ai-memory record pointer. */
export function recordPointer(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    const pointer = path.join(dir, RECORD_POINTER_RELPATH);
    if (fs.existsSync(pointer)) {
      const target = fs.readFileSync(pointer, 'utf8').trim();
      if (target && fs.existsSync(target)) return { pointer, root: dir, target: path.resolve(target) };
      return null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Resolves the canonical knowledge root.
 *
 *   1. an explicit argument or `KAD_VAULT` — always wins, used by tests and by
 *      operators who need to point a command at a specific tree;
 *   2. the ai-memory record pointer (`.ai-memory/vault-path`), which names the
 *      wiki of record once the memory substrate owns the corpus;
 *   3. `<cwd>/vault` — the deterministic mirror, which is all a fresh clone or
 *      CI has before the substrate is installed.
 */
export function vaultRoot(input) {
  if (input !== undefined) return path.resolve(input);
  if (process.env.KAD_VAULT) return path.resolve(process.env.KAD_VAULT);
  const pointer = recordPointer();
  return pointer ? pointer.target : path.resolve('vault');
}

/**
 * Refuses a mutating operation aimed at the derived mirror.
 *
 * `vault/` is regenerated from the record, so a write there is silently
 * destroyed by the next publish. Mutating callers must fail closed instead of
 * accepting work that cannot survive.
 */
export function assertCanonicalRoot(root, operation = 'write') {
  const resolved = path.resolve(root);
  const pointer = recordPointer();
  if (!pointer) return resolved;                 // no record published: the mirror is canonical
  if (pointer.target === resolved) return resolved;
  const mirror = path.join(pointer.root, 'vault');
  if (resolved === mirror) {
    throw new Error(
      `${operation} refused: ${resolved} is the derived mirror of the memory record. ` +
      `The wiki of record is ${pointer.target}; set KAD_VAULT to it or operate there directly.`
    );
  }
  return resolved;
}
export function ensureVault(root=vaultRoot()) { for (const z of VAULT_ZONES) fs.mkdirSync(safe(root,path.join(root,z)),{recursive:true}); if(!fs.existsSync(path.join(root,'index.md'))) fs.writeFileSync(path.join(root,'index.md'),'# KAD Canonical Vault\n\nCanonical human-editable knowledge. Derived projections are disposable.\n'); if(!fs.existsSync(path.join(root,'log.md'))) fs.writeFileSync(path.join(root,'log.md'),'# Vault log\n'); if(!fs.existsSync(path.join(root,'00_Home','Home.md'))) fs.writeFileSync(path.join(root,'00_Home','Home.md'),'---\nkad_id: kad-home\ntitle: KAD-PI knowledge home\ntype: documentation\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: PROJECT_INFERENCE\nreview_status: APPROVED\nvisibility: project\ncontext_eligible: false\ntrain_eligible: false\npublish: false\n---\n\n# KAD-PI Knowledge Home\n\n- [[Project-Map]]\n- [[Navigation]]\n- [[../01_Governance/AUTHORITY]]\n- [[../01_Governance/PROPERTY_REGISTRY]]\n'); for (const [name, body] of [['Project-Map.md','# KAD-PI Project Map\\n\\nCanonical project navigation.'],['Navigation.md','# Navigation\\n\\nUse the dashboards and filtered Bases views for discovery.']]) { const file=path.join(root,'00_Home',name); if(!fs.existsSync(file)) fs.writeFileSync(file,`---\\nkad_id: kad-${name.slice(0,-3).toLowerCase().replaceAll(/[^a-z0-9]+/g,'-')}\\ntype: documentation\\nauthority: CANONICAL_KNOWLEDGE\\nepistemic_class: PROJECT_INFERENCE\\nreview_status: APPROVED\\nvisibility: project\\ncontext_eligible: false\\ntrain_eligible: false\\npublish: false\\n---\\n\\n${body}\\n`); } return root; }
function parseFrontmatter(text) { const normalized=text.replaceAll('\\n','\n'); if(!normalized.startsWith('---\n')) return {}; const end=normalized.indexOf('\n---',4); if(end<0) return {}; const out={}; for(const line of normalized.slice(4,end).split('\n')) { const m=line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/); if(!m) continue; let v=m[2].trim(); if(v.startsWith('[')&&v.endsWith(']')) { try {v=JSON.parse(v.replaceAll("'",'\"'));} catch {v=v.slice(1,-1).split(',').map(x=>x.trim()).filter(Boolean);} } else if(v==='true'||v==='false') v=v==='true'; out[m[1]]=v; } return out; }
export function noteMetadata(text,file='') { const fm=parseFrontmatter(text); return {...fm,path:file,content_hash:sha256(text)}; }
export function files(root, sub='') { const dir=safe(root,path.join(root,sub)); if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(root,path.join(sub,e.name)):(e.name.endsWith('.md')?[path.join(dir,e.name)]:[])); }
export function lintVault(root=vaultRoot()) {
 ensureVault(root);
 const notes=files(root).map(file => {
  const text = fs.readFileSync(file, 'utf8');
  return { file, text, meta: noteMetadata(text, path.relative(root, file)) };
 });
 const errors=[], warnings=[];
 for(const n of notes) {
  const m=n.meta;
  const rel=String(m.path).split(path.sep).join('/');
  // Reserved names carry no `kad_id`: `index.md`, `log.md` and `bootstrap.md` are
  // OKF bundle-reserved at any level, `_meta.md` is the ai-memory scope manifest,
  // and `00_Home/Log.md` is the vault ledger relocated out of the reserved root
  // name when the wiki of record took ownership of the corpus.
  const exempt=RESERVED_NAMES.includes(rel.split('/').pop().toLowerCase());
  const canon=inCanonScope(rel);
  const isExemptDir = inNonCanonicalZone(rel);
  if(!canon) warnings.push({code:'OUTSIDE_DECLARED_ZONE',path:rel});
  else if(!m.kad_id && !isExemptDir && !exempt) errors.push({code:'MISSING_KAD_ID',path:rel});
  if(m.authority===AUTHORITY.RAW_EVIDENCE && m.context_eligible===true) errors.push({code:'RAW_CONTEXT_FORBIDDEN',path:rel});
  if(m.epistemic_class===EPISTEMIC.SOURCE_FACT && (!m.sources||!m.source_hashes)) errors.push({code:'SOURCE_FACT_NEEDS_EVIDENCE',path:rel});
  if(m.context_eligible===true&&! [AUTHORITY.CANONICAL_KNOWLEDGE,AUTHORITY.CANONICAL_PROJECT_DECISION].includes(m.authority)) errors.push({code:'INELIGIBLE_AUTHORITY',path:rel});
  if(m.train_eligible===true&&(m.epistemic_class===EPISTEMIC.UNKNOWN||m.review_status!=='APPROVED')) errors.push({code:'TRAINING_GATE',path:rel});
 }
 return {ok:errors.length===0,errors,warnings,notes:notes.map(n=>n.meta),count:notes.length};
}
/**
 * Mints canonical ids for canon pages that arrived without one.
 *
 * Ids are path-addressed: these pages are edited in place, and an id derived
 * from the bytes would stop describing the file that carries it on the first
 * edit. `migration.mjs` hashes content instead because it imports immutable
 * legacy artifacts.
 *
 * `apply` is off by default; the caller sees exactly what would change first.
 */
export function mintIds(root=vaultRoot(), {apply=false}={}) {
 ensureVault(root);
 const minted=[], held=new Set();
 for(const file of files(root)) {
  const rel=path.relative(root, file).split(path.sep).join('/');
  const meta=noteMetadata(fs.readFileSync(file,'utf8'), rel);
  if(meta.kad_id) { held.add(meta.kad_id); continue; }
  if(!inCanonScope(rel) || inNonCanonicalZone(rel)) continue;
  if(RESERVED_NAMES.includes(rel.split('/').pop().toLowerCase())) continue;
  minted.push({path:rel, kad_id:stableKadId(rel)});
 }
 const collisions=minted.filter(entry=>held.has(entry.kad_id));
 if(collisions.length) throw new Error(`kad_id collision: ${collisions.map(c=>c.path).join(', ')}`);
 if(apply) for(const entry of minted) {
  const file=path.join(root, entry.path);
  const text=fs.readFileSync(file,'utf8');
  if(!text.startsWith('---\n')) throw new Error(`refusing to mint into ${entry.path}: no frontmatter block`);
  fs.writeFileSync(file, `---\nkad_id: ${entry.kad_id}\n${text.slice(4)}`);
 }
 return {root, applied:apply, total:files(root).length, minted};
}
export function contextEligible(meta) {
 if (!meta || meta.context_eligible !== true || meta.review_status !== 'APPROVED') return false;
 if (![AUTHORITY.CANONICAL_KNOWLEDGE, AUTHORITY.CANONICAL_PROJECT_DECISION].includes(meta.authority)) return false;
 if (meta.epistemic_class === EPISTEMIC.UNKNOWN) return false;
 const p = String(meta.path || '').replaceAll('\\', '/');
 if (p.startsWith('00_Governance/') || p.startsWith('10_Raw/') || p.startsWith('10_Inbox/') || p.startsWith('80_Review/') || p.startsWith('90_Derived/') || p.startsWith('99_Archive/')) return false;
 return true;
}
export function ingestSource({root=vaultRoot(),sourceId,content,metadata={}}) { assertCanonicalRoot(root, 'ingest'); ensureVault(root); if(!sourceId||typeof content!=='string') throw new Error('sourceId and content required'); const hash=sha256(content), id=String(sourceId).replace(/[^A-Za-z0-9._-]/g,'_'); const raw=path.join(root,'10_Raw',`${id}.md`); if(fs.existsSync(raw)){const old=fs.readFileSync(raw,'utf8'); if(!old.includes(`source_hash: ${hash}`)) throw new Error('source conflict'); return {deduplicated:true,source_hash:hash,path:raw};} fs.writeFileSync(raw,`---\nsource_id: ${id}\nsource_hash: ${hash}\nauthority: RAW_EVIDENCE\nreview_status: UNREVIEWED\ncontext_eligible: false\n---\n\n${content}`); const manifest=path.join(root,'20_Sources',`${id}.json`); fs.writeFileSync(manifest,JSON.stringify({source_id:id,source_hash:hash,metadata},null,2)+'\n'); return {deduplicated:false,source_hash:hash,path:raw}; }
export function propose({root=vaultRoot(),proposalId=`proposal-${Date.now()}`,target,body,sourceIds=[],sourceHashes=[],epistemicClass=EPISTEMIC.DERIVED_SYNTHESIS,agent='unknown',operation='create'}) { assertCanonicalRoot(root, 'propose'); ensureVault(root); if(!target||typeof body!=='string') throw new Error('target and body required'); const proposal={proposal_id:proposalId,created:new Date().toISOString(),agent,base_revision:revision(root),target_canonical_files:[target],source_ids:sourceIds,source_hashes:sourceHashes,epistemic_class:epistemicClass,intended_operation:operation,status:'PENDING',body}; const bytes=JSON.stringify(proposal,null,2)+'\n'; proposal.proposal_hash=sha256(bytes); fs.writeFileSync(safe(root,path.join(root,'80_Review/Pending',`${proposalId}.json`)),JSON.stringify(proposal,null,2)+'\n'); return proposal; }
export function revision(root=vaultRoot()) { const entries=files(root).filter(f=>!f.includes('90_Derived')); return sha256(entries.sort().map(f=>`${path.relative(root,f)}:${sha256(fs.readFileSync(f))}`).join('\n')); }
function proposalFile(root,id){return safe(root,path.join(root,'80_Review/Pending',`${id}.json`));}
export function approve({root=vaultRoot(),proposalId,actor='human'}) {
 assertCanonicalRoot(root, 'approve');
 if(process.env.KAD_AGENT_EXECUTION==='1' || process.env.OMP_AGENT==='1' || process.env.AI_AGENT==='1') throw new Error('agent execution cannot approve proposals');
 const file=proposalFile(root,proposalId), p=JSON.parse(fs.readFileSync(file));
 const {proposal_hash: ignored, ...unsigned}=p;
 const expected=sha256(JSON.stringify(unsigned,null,2)+'\n');
 if(p.proposal_hash!==expected) throw new Error('proposal hash mismatch');
 const targetPreviousHashes = {};
 for (const targetPath of (p.target_canonical_files || [])) {
   const fullTarget = safe(root, path.join(root, targetPath));
   targetPreviousHashes[targetPath] = fs.existsSync(fullTarget) ? sha256(fs.readFileSync(fullTarget, 'utf8')) : null;
 }
 const receipt = {
   proposal_id: p.proposal_id,
   proposal_hash: p.proposal_hash,
   target_canonical_files: [...(p.target_canonical_files || [])],
   target_previous_hashes: targetPreviousHashes,
   intended_operation: p.intended_operation || 'create',
   canonical_revision: revision(root),
   approved_at: new Date().toISOString(),
   actor,
   status: 'APPROVED'
 };
 fs.writeFileSync(safe(root,path.join(root,'80_Review/Receipts',`${proposalId}.json`)),JSON.stringify(receipt,null,2)+'\n');
 p.status='APPROVED'; fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n'); return receipt;
}
export function applyProposal({root=vaultRoot(),proposalId}) {
 assertCanonicalRoot(root, 'apply');
 const file=proposalFile(root,proposalId), p=JSON.parse(fs.readFileSync(file));
 const receiptFile=safe(root,path.join(root,'80_Review/Receipts',`${proposalId}.json`));
 if(!fs.existsSync(receiptFile)) throw new Error('approval receipt required');
 const r=JSON.parse(fs.readFileSync(receiptFile));
 const unsigned = Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'proposal_hash').map(([k, v]) => [k, k === 'status' ? 'PENDING' : v]));
 const bytes = JSON.stringify(unsigned, null, 2) + '\n';
 if(r.proposal_hash !== sha256(bytes)) throw new Error('proposal changed after approval');
 if(!Array.isArray(p.target_canonical_files) || p.target_canonical_files.length===0) throw new Error('no target files specified');
 const normalizedTarget = String(p.target_canonical_files[0]).replaceAll('\\', '/');
 if(path.isAbsolute(normalizedTarget)) throw new Error('absolute target rejected');
 if(normalizedTarget.startsWith('00_Governance/') || normalizedTarget.startsWith('80_Review/Receipts/')) throw new Error('unauthorized zone: governance and review receipts cannot be mutated via proposal');
 if (r.target_canonical_files && JSON.stringify(r.target_canonical_files) !== JSON.stringify(p.target_canonical_files)) throw new Error('target canonical files mismatch between receipt and proposal');
 if (r.intended_operation && r.intended_operation !== (p.intended_operation || 'create')) throw new Error('intended operation mismatch between receipt and proposal');
 if (r.target_previous_hashes) {
   for (const targetPath of p.target_canonical_files) {
     const fullTarget = safe(root, path.join(root, targetPath));
     const currentHash = fs.existsSync(fullTarget) ? sha256(fs.readFileSync(fullTarget, 'utf8')) : null;
     if (currentHash !== r.target_previous_hashes[targetPath]) {
       throw new Error(`target previous hash mismatch: intervening mutation detected on ${targetPath}`);
     }
   }
 }
 const target=safe(root,path.join(root,normalizedTarget)); fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,p.body); p.status='APPLIED'; fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n'); return {applied:true,path:target,revision:revision(root)};
}
export function query({root=vaultRoot(),query='',limit=10}) {
 const clampedLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
 const q=query.toLowerCase(), out=[];
 for(const file of files(root)){
   const text=fs.readFileSync(file,'utf8'), m=noteMetadata(text,path.relative(root,file));
   if(contextEligible(m)&&(!q||text.toLowerCase().includes(q))) {
     out.push({kad_id:m.kad_id,path:m.path,title:m.title,epistemic_class:m.epistemic_class,excerpt:text.replace(/^---[\s\S]*?---\n/,'').slice(0,500)});
   }
 }
 return out.slice(0,clampedLimit);
}
export function buildContextPack({root=vaultRoot(),query='',task='',limit=5}) { const notes=query?queryNotes(root,query,limit):queryNotes(root,task,limit); const pack={task,query,canonical_revision:revision(root),notes,generation_fingerprint:sha256(JSON.stringify({task,query,notes}))}; const file=path.join(root,'90_Derived/ContextPacks',`${sha256(JSON.stringify(pack)).slice(0,16)}.json`); fs.writeFileSync(file,JSON.stringify(pack,null,2)+'\n'); return pack; }
function queryNotes(root,q,limit){return query({root,query:q,limit}).map(n=>({...n,source_references:[]}));}
export function packFresh(pack,root=vaultRoot()){return pack?.canonical_revision===revision(root);}
export function rebuild(root=vaultRoot()){assertCanonicalRoot(root, 'rebuild');const lint=lintVault(root); if(!lint.ok) throw new Error(`lint failed: ${lint.errors.map(e=>e.code).join(',')}`); const manifest={schema:'kad-canonical-manifest-v1',canonical_revision:revision(root),notes:lint.notes.filter(contextEligible).map(({kad_id,path,content_hash,epistemic_class,authority,review_status})=>({kad_id,path,content_hash,epistemic_class,authority,review_status}))}; fs.writeFileSync(path.join(root,'90_Derived/KnowledgePlane','manifest.json'),JSON.stringify(manifest,null,2)+'\n'); fs.writeFileSync(path.join(root,'90_Derived/Indexes','lexical.json'),JSON.stringify(manifest.notes,null,2)+'\n'); compileProjections({root}); return manifest; }
