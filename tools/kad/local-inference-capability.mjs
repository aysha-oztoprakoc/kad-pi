import { spawn } from 'node:child_process';
import { StcScope } from './stc-scope.mjs';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function healthy(url, timeoutMs = 500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch { return false; }
  finally { clearTimeout(timer); }
}

/** STC-owned local inference process and capability advertisement. */
export class LocalInferenceCapability {
  constructor({ command, args = [], endpoint, healthPath = '/api/v1/model', registry, resource, scope = new StcScope('local-inference'), externallyControlled = false, startupTimeoutMs = 10000 }) {
    if (!endpoint || !registry || !resource) throw new Error('endpoint, registry, and resource are required');
    this.command = command; this.args = args; this.endpoint = endpoint.replace(/\/$/, ''); this.healthPath = healthPath;
    this.registry = registry; this.resource = resource; this.scope = scope; this.externallyControlled = externallyControlled; this.startupTimeoutMs = startupTimeoutMs;
    this.process = null; this.state = 'INACTIVE'; this.effectDisposers = [];
  }

  async activate() {
    if (this.state !== 'INACTIVE') throw new Error(`cannot activate from ${this.state}`);
    this.state = 'ACTIVATING';
    try {
      if (this.command && !this.externallyControlled) {
        this.process = spawn(this.command, this.args, { stdio: 'ignore' });
        this.scope.registerEffect('local-inference.process', async () => {
          if (!this.process || this.process.killed) return;
          this.process.kill('SIGTERM');
          await Promise.race([new Promise(resolve => this.process.once('exit', resolve)), sleep(1000)]);
          if (!this.process.killed) this.process.kill('SIGKILL');
        });
      }
      const deadline = Date.now() + this.startupTimeoutMs;
      while (Date.now() < deadline && !(await healthy(`${this.endpoint}${this.healthPath}`))) await sleep(50);
      if (!(await healthy(`${this.endpoint}${this.healthPath}`))) throw new Error('local inference health check failed');
      this.registry.register({ ...this.resource, available: true, endpoint: this.endpoint, lifecycle: this.externallyControlled ? 'EXTERNAL' : 'OWNED' });
      this.scope.registerEffect('local-inference.capability', () => this.registry.setAvailability(this.resource.id, false, 'STC scope disposed')); 
      this.state = 'ACTIVE';
      return { state: this.state, endpoint: this.endpoint, ownership: this.externallyControlled ? 'EXTERNAL' : 'OWNED' };
    } catch (error) {
      this.state = 'FAILED';
      await this.dispose();
      throw error;
    }
  }

  async dispose() {
    if (this.state === 'DISPOSED') return;
    await this.scope.dispose();
    this.effectDisposers = [];
    this.state = 'DISPOSED';
    return { state: this.state, process_owned: !this.externallyControlled };
  }
}
