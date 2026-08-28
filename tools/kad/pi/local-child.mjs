import { spawn } from 'node:child_process';

export function validateLocalChildOutput(text) {
  const value = String(text ?? '').trim();
  return { accepted: value === 'READY', value, expected: 'READY' };
}

export function buildLocalChildInvocation({ cwd = process.cwd(), agentDir = `${cwd}/.pi/agent`, model = 'kad-local-qwen/qwen-local', task = 'bounded extraction', systemPrompt = `${cwd}/.omp/agents/kad-local-extractor.md`, piCommand = 'pi' } = {}) {
  return { command: piCommand, cwd, env: { ...process.env, PI_CODING_AGENT_DIR: agentDir }, args: ['--mode', 'json', '-p', '--no-session', '--model', model, '--no-tools', '--no-context-files', '--no-skills', '--no-extensions', '--thinking', 'off', ...(systemPrompt ? ['--append-system-prompt', systemPrompt] : []), `Task: ${typeof task === 'string' ? task : JSON.stringify(task)}`] };
}

export async function runLocalPiChild(options = {}) {
  const invocation = buildLocalChildInvocation(options);
  const started = performance.now();
  return await new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, { cwd: invocation.cwd, env: invocation.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', exitCode => {
      const events = stdout.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
      const messages = events.filter(event => event.type === 'message_end').map(event => event.message).filter(Boolean);
      const assistant = [...messages].reverse().find(message => message.role === 'assistant');
      const text = assistant?.content?.filter(part => part.type === 'text').map(part => part.text).join('') ?? '';
      const usage = messages.reduce((sum, message) => ({ input: sum.input + (message.usage?.input ?? 0), output: sum.output + (message.usage?.output ?? 0) }), { input: 0, output: 0 });
      resolve({ child_process: true, provider: invocation.args[5]?.split('/')[0], model: invocation.args[5]?.split('/')[1], task: options.task ?? 'bounded extraction', output: text, validation: validateLocalChildOutput(text), exitCode, stderr, usage, wall_ms: Math.round(performance.now() - started) });
    });
  });
}
