import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const AUTHORITY = Object.freeze({ CANONICAL:'CANONICAL', RAW_EVIDENCE:'RAW_EVIDENCE', PROPOSAL:'PROPOSAL', DERIVED:'DERIVED', EXTERNAL_AUTHORITY_REFERENCE:'EXTERNAL_AUTHORITY_REFERENCE', ARCHIVED:'ARCHIVED', UNKNOWN:'UNKNOWN', CANONICAL_KNOWLEDGE:'CANONICAL_KNOWLEDGE', CANONICAL_PROJECT_DECISION:'CANONICAL_PROJECT_DECISION', PROPOSAL_UNREVIEWED:'PROPOSAL_UNREVIEWED' });
export const EPISTEMIC = Object.freeze({ SOURCE_FACT:'SOURCE_FACT', DERIVED_SYNTHESIS:'DERIVED_SYNTHESIS', PROJECT_INFERENCE:'PROJECT_INFERENCE', UNKNOWN:'UNKNOWN' });
const zones = ['00_Home','00_Governance','10_Inbox','10_Raw','20_Sources','20_Sources/Papers','20_Sources/Documentation','20_Sources/Web','20_Sources/Transcripts','20_Sources/Assets','30_Knowledge','30_Knowledge/Concepts','30_Knowledge/Technologies','30_Knowledge/Models','30_Knowledge/Systems','30_Knowledge/People','30_Knowledge/Organizations','40_Decisions','40_Research/Papers','40_Research/Questions','40_Research/Syntheses','40_Research/Claims','40_Research/Experiments','50_Projects/KAD-PI/Overview','50_Projects/KAD-PI/Architecture','50_Projects/KAD-PI/Roadmap','50_Projects/KAD-PI/Workpackages','50_Projects/KAD-PI/Decisions','50_Projects/KAD-PI/Experiments','50_Projects/KAD-PI/Releases','60_Operations/Machines','60_Operations/Models','60_Operations/Providers','60_Operations/Harnesses','60_Operations/Resources','60_Operations/Metrics','70_Dashboards','80_Review/Pending','80_Review/Rejected','80_Review/Receipts','90_Derived/Indexes','90_Derived/ContextPacks','90_Derived/KnowledgePlane','90_Derived/Sofia','90_Derived/Website','90_Derived/OpenViking','99_Archive'];
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const safe = (root, candidate) => { const r=path.resolve(root), c=path.resolve(candidate); if (c!==r && !c.startsWith(`${r}${path.sep}`)) throw new Error('path escapes vault'); return c; };
export function vaultRoot(input = process.env.KAD_VAULT || path.resolve('vault')) { return path.resolve(input); }
export function ensureVault(root=vaultRoot()) { for (const z of zones) fs.mkdirSync(safe(root,path.join(root,z)),{recursive:true}); if(!fs.existsSync(path.join(root,'index.md'))) fs.writeFileSync(path.join(root,'index.md'),'# KAD Canonical Vault\n\nCanonical human-editable knowledge. Derived projections are disposable.\n'); if(!fs.existsSync(path.join(root,'log.md'))) fs.writeFileSync(path.join(root,'log.md'),'# Vault log\n'); if(!fs.existsSync(path.join(root,'00_Home','Home.md'))) fs.writeFileSync(path.join(root,'00_Home','Home.md'),'---\nkad_id: kad-home\ntitle: KAD-PI knowledge home\ntype: documentation\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: PROJECT_INFERENCE\nreview_status: APPROVED\nvisibility: project\ncontext_eligible: false\ntrain_eligible: false\npublish: false\n---\n\n# KAD-PI Knowledge Home\n\n- [[Project-Map]]\n- [[Navigation]]\n- [[../01_Governance/AUTHORITY]]\n- [[../01_Governance/PROPERTY_REGISTRY]]\n'); for (const [name, body] of [['Project-Map.md','# KAD-PI Project Map\\n\\nCanonical project navigation.'],['Navigation.md','# Navigation\\n\\nUse the dashboards and filtered Bases views for discovery.']]) { const file=path.join(root,'00_Home',name); if(!fs.existsSync(file)) fs.writeFileSync(file,`---\\nkad_id: kad-${name.slice(0,-3).toLowerCase().replaceAll(/[^a-z0-9]+/g,'-')}\\ntype: documentation\\nauthority: CANONICAL_KNOWLEDGE\\nepistemic_class: PROJECT_INFERENCE\\nreview_status: APPROVED\\nvisibility: project\\ncontext_eligible: false\\ntrain_eligible: false\\npublish: false\\n---\\n\\n${body}\\n`); } return root; }
function parseFrontmatter(text) { const normalized=text.replaceAll('\\n','\n'); if(!normalized.startsWith('---\n')) return {}; const end=normalized.indexOf('\n---',4); if(end<0) return {}; const out={}; for(const line of normalized.slice(4,end).split('\n')) { const m=line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/); if(!m) continue; let v=m[2].trim(); if(v.startsWith('[')&&v.endsWith(']')) { try {v=JSON.parse(v.replaceAll("'",'\"'));} catch {v=v.slice(1,-1).split(',').map(x=>x.trim()).filter(Boolean);} } else if(v==='true'||v==='false') v=v==='true'; out[m[1]]=v; } return out; }
export function noteMetadata(text,file='') { const fm=parseFrontmatter(text); return {...fm,path:file,content_hash:sha256(text)}; }
function files(root, sub='') { const dir=safe(root,path.join(root,sub)); if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(root,path.join(sub,e.name)):(e.name.endsWith('.md')?[path.join(dir,e.name)]:[])); }
export function lintVault(root=vaultRoot()) {
 ensureVault(root);
 const notes=files(root).map(file=>({file,text:fs.readFileSync(file,'utf8'),meta:noteMetadata(fs.readFileSync(file,'utf8'),path.relative(root,file))}));
 const errors=[], ids=new Map();
 for(const n of notes) {
  const m=n.meta, exempt=m.path==='index.md'||m.path==='log.md';
  if(!m.kad_id && !m.path.startsWith('00_Governance')&&!m.path.startsWith('10_Raw')&&!m.path.startsWith('80_Review')&&!exempt) errors.push({code:'MISSING_KAD_ID',path:m.path});
  if(m.kad_id){if(ids.has(m.kad_id)) errors.push({code:'DUPLICATE_KAD_ID',id:m.kad_id,path:m.path,other:ids.get(m.kad_id)}); ids.set(m.kad_id,m.path);}
  if(m.authority===AUTHORITY.RAW_EVIDENCE && m.context_eligible===true) errors.push({code:'RAW_CONTEXT_FORBIDDEN',path:m.path});
  if(m.epistemic_class===EPISTEMIC.SOURCE_FACT && (!m.sources||!m.source_hashes)) errors.push({code:'SOURCE_FACT_NEEDS_EVIDENCE',path:m.path});
  if(m.context_eligible===true&&! [AUTHORITY.CANONICAL_KNOWLEDGE,AUTHORITY.CANONICAL_PROJECT_DECISION].includes(m.authority)) errors.push({code:'INELIGIBLE_AUTHORITY',path:m.path});
  if(m.train_eligible===true&&(m.epistemic_class===EPISTEMIC.UNKNOWN||m.review_status!=='APPROVED')) errors.push({code:'TRAINING_GATE',path:m.path});
 }
 return {ok:errors.length===0,errors,notes:notes.map(n=>n.meta),count:notes.length};
}
export function contextEligible(meta) { return meta.context_eligible===true && meta.review_status==='APPROVED' && [AUTHORITY.CANONICAL_KNOWLEDGE,AUTHORITY.CANONICAL_PROJECT_DECISION].includes(meta.authority) && meta.epistemic_class!==EPISTEMIC.UNKNOWN; }
export function ingestSource({root=vaultRoot(),sourceId,content,metadata={}}) { ensureVault(root); if(!sourceId||typeof content!=='string') throw new Error('sourceId and content required'); const hash=sha256(content), id=String(sourceId).replace(/[^A-Za-z0-9._-]/g,'_'); const raw=path.join(root,'10_Raw',`${id}.md`); if(fs.existsSync(raw)){const old=fs.readFileSync(raw,'utf8'); if(!old.includes(`source_hash: ${hash}`)) throw new Error('source conflict'); return {deduplicated:true,source_hash:hash,path:raw};} fs.writeFileSync(raw,`---\nsource_id: ${id}\nsource_hash: ${hash}\nauthority: RAW_EVIDENCE\nreview_status: UNREVIEWED\ncontext_eligible: false\n---\n\n${content}`); const manifest=path.join(root,'20_Sources',`${id}.json`); fs.writeFileSync(manifest,JSON.stringify({source_id:id,source_hash:hash,metadata},null,2)+'\n'); return {deduplicated:false,source_hash:hash,path:raw}; }
export function propose({root=vaultRoot(),proposalId=`proposal-${Date.now()}`,target,body,sourceIds=[],sourceHashes=[],epistemicClass=EPISTEMIC.DERIVED_SYNTHESIS,agent='unknown',operation='create'}) { ensureVault(root); if(!target||typeof body!=='string') throw new Error('target and body required'); const proposal={proposal_id:proposalId,created:new Date().toISOString(),agent,base_revision:revision(root),target_canonical_files:[target],source_ids:sourceIds,source_hashes:sourceHashes,epistemic_class:epistemicClass,intended_operation:operation,status:'PENDING',body}; const bytes=JSON.stringify(proposal,null,2)+'\n'; proposal.proposal_hash=sha256(bytes); fs.writeFileSync(safe(root,path.join(root,'80_Review/Pending',`${proposalId}.json`)),JSON.stringify(proposal,null,2)+'\n'); return proposal; }
export function revision(root=vaultRoot()) { const entries=files(root).filter(f=>!f.includes('90_Derived')); return sha256(entries.sort().map(f=>`${path.relative(root,f)}:${sha256(fs.readFileSync(f))}`).join('\n')); }
function proposalFile(root,id){return safe(root,path.join(root,'80_Review/Pending',`${id}.json`));}
export function approve({root=vaultRoot(),proposalId,actor='human'}) {
 if(process.env.KAD_AGENT_EXECUTION==='1') throw new Error('agent execution cannot approve proposals');
 const file=proposalFile(root,proposalId), p=JSON.parse(fs.readFileSync(file));
 const {proposal_hash: ignored, ...unsigned}=p;
 const expected=sha256(JSON.stringify(unsigned,null,2)+'\n');
 if(p.proposal_hash!==expected) throw new Error('proposal hash mismatch');
 const receipt={proposal_id:p.proposal_id,proposal_hash:p.proposal_hash,approved_at:new Date().toISOString(),actor,status:'APPROVED'};
 fs.writeFileSync(safe(root,path.join(root,'80_Review/Receipts',`${proposalId}.json`)),JSON.stringify(receipt,null,2)+'\n');
 p.status='APPROVED'; fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n'); return receipt;
}
export function applyProposal({root=vaultRoot(),proposalId}) {
 const file=proposalFile(root,proposalId), p=JSON.parse(fs.readFileSync(file));
 const receiptFile=safe(root,path.join(root,'80_Review/Receipts',`${proposalId}.json`));
 if(!fs.existsSync(receiptFile)) throw new Error('approval receipt required');
 const r=JSON.parse(fs.readFileSync(receiptFile));
 const {proposal_hash: ignored, status: ignoredStatus, ...rest}=p;
 const bytes=JSON.stringify({...rest,status:'PENDING'},null,2)+'\n';
 if(r.proposal_hash!==sha256(bytes)) throw new Error('proposal changed after approval');
 if(path.isAbsolute(p.target_canonical_files[0])) throw new Error('absolute target rejected');
 const target=safe(root,path.join(root,p.target_canonical_files[0])); fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,p.body); p.status='APPLIED'; fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n'); return {applied:true,path:target,revision:revision(root)};
}
export function query({root=vaultRoot(),query='',limit=10}) { const q=query.toLowerCase(), out=[]; for(const file of files(root)){const text=fs.readFileSync(file,'utf8'), m=noteMetadata(text,path.relative(root,file)); if(contextEligible(m)&&(!q||text.toLowerCase().includes(q))) out.push({kad_id:m.kad_id,path:m.path,title:m.title,epistemic_class:m.epistemic_class,excerpt:text.replace(/^---[\s\S]*?---\n/,'').slice(0,500)}); } return out.slice(0,limit); }
export function buildContextPack({root=vaultRoot(),query='',task='',limit=5}) { const notes=query?queryNotes(root,query,limit):queryNotes(root,task,limit); const pack={task,query,canonical_revision:revision(root),notes,generation_fingerprint:sha256(JSON.stringify({task,query,notes}))}; const file=path.join(root,'90_Derived/ContextPacks',`${sha256(JSON.stringify(pack)).slice(0,16)}.json`); fs.writeFileSync(file,JSON.stringify(pack,null,2)+'\n'); return pack; }
function queryNotes(root,q,limit){return query({root,query:q,limit}).map(n=>({...n,source_references:[]}));}
export function packFresh(pack,root=vaultRoot()){return pack?.canonical_revision===revision(root);}
export function rebuild(root=vaultRoot()){const lint=lintVault(root); if(!lint.ok) throw new Error(`lint failed: ${lint.errors.map(e=>e.code).join(',')}`); const manifest={schema:'kad-canonical-manifest-v1',canonical_revision:revision(root),notes:lint.notes.filter(contextEligible).map(({kad_id,path,content_hash,epistemic_class,authority,review_status})=>({kad_id,path,content_hash,epistemic_class,authority,review_status}))}; fs.writeFileSync(path.join(root,'90_Derived/KnowledgePlane','manifest.json'),JSON.stringify(manifest,null,2)+'\n'); fs.writeFileSync(path.join(root,'90_Derived/Indexes','lexical.json'),JSON.stringify(manifest.notes,null,2)+'\n'); return manifest; }
