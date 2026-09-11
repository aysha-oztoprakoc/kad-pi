import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureVault, ingestSource, propose, approve, applyProposal, lintVault, mintIds, query, buildContextPack, packFresh, rebuild } from '../wiki/index.mjs';
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'kad-vault-'));
test('unreviewed and raw material never enters context',()=>{const root=tmp();ensureVault(root); ingestSource({root,sourceId:'s1',content:'secret raw'}); propose({root,proposalId:'p1',target:'30_Knowledge/x.md',body:'---\nkad_id: k1\nauthority: PROPOSAL_UNREVIEWED\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: PENDING\ncontext_eligible: false\n---\ntext'}); assert.equal(query({root,query:'raw'}).length,0);});
test('approval hash binds exact proposal and apply is gated',()=>{const root=tmp();ensureVault(root); const p=propose({root,proposalId:'p2',target:'30_Knowledge/x.md',body:'---\nkad_id: k2\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: APPROVED\ncontext_eligible: true\n---\nknown'}); assert.throws(()=>applyProposal({root,proposalId:p.proposal_id}),/approval/); approve({root,proposalId:p.proposal_id}); const f=path.join(root,'80_Review/Pending/p2.json'); const edited=JSON.parse(fs.readFileSync(f)); edited.body+='changed'; fs.writeFileSync(f,JSON.stringify(edited)); assert.throws(()=>applyProposal({root,proposalId:'p2'}),/changed|hash/);});
test('approved canonical notes compile and packs stale',()=>{const root=tmp();ensureVault(root); fs.writeFileSync(path.join(root,'30_Knowledge','x.md'),'---\nkad_id: k3\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: SOURCE_FACT\nreview_status: APPROVED\ncontext_eligible: true\nsources: s\nsource_hashes: h\n---\nalpha'); assert.equal(lintVault(root).ok,true); const m=rebuild(root); assert.equal(m.notes.length,1); const p=buildContextPack({root,query:'alpha'}); assert.equal(packFresh(p,root),true); fs.appendFileSync(path.join(root,'30_Knowledge','x.md'),'\nbeta'); assert.equal(packFresh(p,root),false);});
test('target-bound receipt binds target paths and detects target mutation before apply', () => {
  const root = tmp();
  ensureVault(root);
  fs.writeFileSync(path.join(root, '30_Knowledge', 'existing.md'), '---\nkad_id: k-exist\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: SOURCE_FACT\nreview_status: APPROVED\ncontext_eligible: true\nsources: s\nsource_hashes: h\n---\ninitial content');
  const p = propose({
    root,
    proposalId: 'p-update',
    target: '30_Knowledge/existing.md',
    body: '---\nkad_id: k-exist\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: SOURCE_FACT\nreview_status: APPROVED\ncontext_eligible: true\nsources: s\nsource_hashes: h\n---\nupdated content',
    operation: 'update'
  });
  const receipt = approve({ root, proposalId: p.proposal_id });
  assert.deepEqual(receipt.target_canonical_files, ['30_Knowledge/existing.md']);
  assert.equal(typeof receipt.target_previous_hashes['30_Knowledge/existing.md'], 'string');
  assert.equal(typeof receipt.canonical_revision, 'string');
  // Simulate concurrent mutation of target file before apply
  fs.appendFileSync(path.join(root, '30_Knowledge', 'existing.md'), '\nconcurrent edit');
  assert.throws(() => applyProposal({ root, proposalId: p.proposal_id }), /target (previous )?hash mismatch|intervening mutation/i);
});

test('proposal cannot target governance or receipts zones', () => {
  const root = tmp();
  ensureVault(root);
  const p = propose({
    root,
    proposalId: 'p-exploit',
    target: '00_Governance/AUTHORITY.md',
    body: 'compromised'
  });
  approve({ root, proposalId: p.proposal_id });
  assert.throws(() => applyProposal({ root, proposalId: p.proposal_id }), /unauthorized zone|governance/i);
});

test('context query enforces maximum limit and excludes non-canonical zones', () => {
  const root = tmp();
  ensureVault(root);
  fs.writeFileSync(path.join(root, '80_Review', 'draft.md'), '---\nkad_id: draft1\nauthority: PROPOSAL\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: PENDING\ncontext_eligible: true\n---\nneedle search');
  fs.writeFileSync(path.join(root, '99_Archive', 'old.md'), '---\nkad_id: old1\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: APPROVED\ncontext_eligible: true\n---\nneedle search');
  fs.writeFileSync(path.join(root, '30_Knowledge', 'legit.md'), '---\nkad_id: legit1\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: APPROVED\ncontext_eligible: true\n---\nneedle search');
  const res = query({ root, query: 'needle', limit: 100 });
  assert.equal(res.length, 1);
  assert.equal(res[0].kad_id, 'legit1');
});

test('canon zones require an id while substrate capture outside the layout is only reported', () => {
  const root = tmp();
  ensureVault(root);
  fs.mkdirSync(path.join(root, 'sessions'), { recursive: true });
  fs.writeFileSync(path.join(root, 'sessions', '01a0-live.md'), '---\ntier: episodic\n---\ncaptured turn');
  const substrate = lintVault(root);
  assert.equal(substrate.ok, true, 'a page the substrate writes is not a canon violation');
  assert.ok(substrate.warnings.some((w) => w.path === 'sessions/01a0-live.md'), 'substrate capture is reported, not enforced');

  fs.writeFileSync(path.join(root, '40_Research', 'Papers', 'NoId.md'), '---\ntype: paper\n---\nunidentified');
  const canon = lintVault(root);
  assert.equal(canon.ok, false, 'a canon page without an id still fails');
  assert.deepEqual(canon.errors, [{ code: 'MISSING_KAD_ID', path: '40_Research/Papers/NoId.md' }]);
});

test('mintIds identifies canon pages, never rewrites an existing id, and is idempotent', () => {
  const root = tmp();
  ensureVault(root);
  fs.writeFileSync(path.join(root, '40_Research', 'Papers', 'A.md'), '---\ntype: paper\ntitle: A\n---\nbody');
  fs.writeFileSync(path.join(root, '30_Knowledge', 'B.md'), '---\nkad_id: hand-written\ntitle: B\n---\nbody');
  fs.writeFileSync(path.join(root, '10_Raw', 's1.md'), '---\nsource_id: s1\n---\nraw');
  fs.mkdirSync(path.join(root, 'sessions'), { recursive: true });
  fs.writeFileSync(path.join(root, 'sessions', 'ep.md'), '---\ntier: episodic\n---\ncapture');

  const plan = mintIds(root);
  assert.deepEqual(plan.minted.map((m) => m.path), ['40_Research/Papers/A.md']);
  assert.equal(plan.applied, false, 'planning alone must not write');
  assert.equal(fs.readFileSync(path.join(root, '40_Research', 'Papers', 'A.md'), 'utf8').includes('kad_id:'), false);

  const applied = mintIds(root, { apply: true });
  const id = applied.minted[0].kad_id;
  assert.match(id, /^kad-[0-9a-f]{24}$/);
  assert.equal(lintVault(root).ok, true);
  const mintedText = fs.readFileSync(path.join(root, '40_Research', 'Papers', 'A.md'), 'utf8');
  assert.match(mintedText, new RegExp(`^---\\nkad_id: ${id}\\n`), 'the id heads the frontmatter block');
  assert.ok(mintedText.includes('title: A'), 'existing frontmatter keys survive');
  assert.ok(mintedText.trimEnd().endsWith('body'), 'the body survives');
  assert.equal(fs.readFileSync(path.join(root, '30_Knowledge', 'B.md'), 'utf8').includes('kad_id: hand-written'), true, 'an existing id is preserved');
  assert.deepEqual(mintIds(root).minted, [], 'a second pass has nothing left to do');
});
