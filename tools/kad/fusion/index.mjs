import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
export const UPSTREAM={repository:'https://github.com/disler/fusion-harness',commit:'01a348202482cad0e7d3c34eada180f711aaddd7'};
export const STACKS={economy:['gpt-5.1-codex-mini','gpt-5-mini'],standard:['gpt-5.2-codex','claude-4.5-sonnet','gemini-3-flash'],frontier:['gpt-5.6-luna','claude-4.6-opus-high','gemini-3-pro']};
export function stack(name='economy'){if(!STACKS[name]) throw new Error(`unknown fusion stack: ${name}`); return {name,models:STACKS[name],default:name==='economy'};}
export function setup(root=path.resolve('.omp/fusion')){fs.mkdirSync(root,{recursive:true}); const m={schema:'kad-fusion-omp-v1',upstream:UPSTREAM,host:'omp',child_command:'omp --headless --json',ambient_extensions:false,ambient_skills:false,ambient_rules:false,mutation:{requires:['fusion_writer_lease','kad_workctl_mutation_authorization'],default:'deny'},stacks:STACKS}; fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(m,null,2)+'\n'); return m;}
export function launch(name='economy',args=[]){const s=stack(name); const child=spawnSync('omp',['--headless','--json','--model',s.models[0],...args],{stdio:'inherit'}); if(child.error) throw child.error; return child.status??1;}
export function authorizeMutation({fusionLease=false,kadAuthorization=false}={}){if(!fusionLease||!kadAuthorization) throw new Error('mutation denied: Fusion lease and KAD authorization required'); return true;}
