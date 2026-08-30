import { rebuild, query, buildContextPack, packFresh, revision, vaultRoot } from '../wiki/index.mjs';
export { rebuild, query, buildContextPack, packFresh, revision, vaultRoot };
export function semanticStatus({available=false,root=vaultRoot()}={}) { return {provider:'OpenViking',state:available?'AVAILABLE':'UNAVAILABLE',authority:'DERIVED',fallback:available?'deterministic-index':'deterministic-index',canonical_revision:revision(root)}; }
export function search({root=vaultRoot(),query:term='',limit=10}={}) { return query({root,query:term,limit}); }
export function materialize({root=vaultRoot(),task,query:term,limit=5}={}) { const pack=buildContextPack({root,task,query:term,limit}); if(!packFresh(pack,root)) throw new Error('context pack stale'); return pack; }
