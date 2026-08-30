import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureVault, rebuild } from '../wiki/index.mjs';
import { search, materialize, semanticStatus } from '../wiki-library/index.mjs';
function root(){return fs.mkdtempSync(path.join(os.tmpdir(),'kad-library-'));}
test('offline lexical search and bounded pack use approved notes',()=>{const r=root();ensureVault(r);fs.writeFileSync(path.join(r,'30_Knowledge','a.md'),'---\nkad_id: a\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: DERIVED_SYNTHESIS\nreview_status: APPROVED\ncontext_eligible: true\n---\nneedle governed');rebuild(r);assert.equal(search({root:r,query:'governed'}).length,1);const p=materialize({root:r,task:'answer',query:'governed'});assert.equal(p.notes.length,1);});
test('semantic service outage degrades to deterministic index',()=>{const r=root();ensureVault(r);assert.equal(semanticStatus({root:r}).state,'UNAVAILABLE');assert.equal(semanticStatus({root:r}).fallback,'deterministic-index');});
