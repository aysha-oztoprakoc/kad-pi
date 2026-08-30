import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setup, stack, authorizeMutation, UPSTREAM } from '../fusion/index.mjs';
test('Fusion is pinned and OMP-hosted',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'fusion-')); const m=setup(root); assert.equal(m.upstream.commit,UPSTREAM.commit); assert.equal(m.host,'omp'); assert.equal(m.child_command,'omp --headless --json');});
test('economy is bounded default and mutation fails closed',()=>{assert.equal(stack('economy').models.length,2); assert.equal(stack('economy').default,true); assert.throws(()=>authorizeMutation(),/required/); assert.equal(authorizeMutation({fusionLease:true,kadAuthorization:true}),true);});
