import crypto from 'node:crypto';

function safeClone(value) {
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { error: 'Uncloneable payload' };
    }
  }
}

export class CausalJournal {
  constructor(options = {}) {
    this.options = options;
    this._entries = [];
    this._byId = new Map();
  }

  append(entry) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const cloned = safeClone(entry);
    const seq = this._entries.length + 1;
    const id = cloned.id || (cloned.eventId ? String(cloned.eventId) : crypto.randomUUID());
    const record = {
      ...cloned,
      id,
      seq,
      timestamp: cloned.timestamp ?? Date.now(),
    };
    const immutableRecord = Object.freeze(record);
    this._entries.push(immutableRecord);
    this._byId.set(id, immutableRecord);
    return safeClone(record);
  }

  getEntries() {
    return this._entries.map((e) => safeClone(e));
  }

  getById(id) {
    const entry = this._byId.get(id);
    return entry ? safeClone(entry) : undefined;
  }

  verifyIntegrity() {
    const seenIds = new Set();
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i];
      if (entry.seq !== i + 1) return false;
      if (!entry.id || seenIds.has(entry.id)) return false;
      seenIds.add(entry.id);
      const parentId = entry.parentId || entry.causationId;
      if (parentId && !seenIds.has(parentId)) return false;
    }
    return true;
  }

  get length() { return this._entries.length; }
}

export class PiTracer {
  constructor(options = {}) {
    this.options = options;
    this.journal = options.journal || new CausalJournal();
    this._runtime = null;
    this._listeners = new Map();
    this._disposed = false;
    this._status = 'uninitialized';
    this._seenEventIds = new Set();
    this._sessionRoots = new Map();
    this._toolCalls = new Map();
  }

  attach(piRuntime) {
    if (this._disposed || !piRuntime) return this;
    this._runtime = piRuntime;
    this._status = 'active';
    const monitoredEvents = ['session_start', 'tool_call', 'tool_result', 'tool_error', 'session_shutdown'];
    for (const eventName of monitoredEvents) {
      const listener = (payload) => this._handleEvent(eventName, payload);
      this._listeners.set(eventName, listener);
      piRuntime.on(eventName, listener);
    }
    return this;
  }

  _handleEvent(type, rawPayload) {
    if (this._disposed || rawPayload === null || rawPayload === undefined) return;
    const payload = typeof rawPayload === 'object' ? safeClone(rawPayload) : { value: rawPayload };

    let dedupKey = payload.eventId ? String(payload.eventId) : null;
    if (!dedupKey) {
      const parts = [type];
      if (payload.sessionId !== undefined && payload.sessionId !== null) {
        parts.push(`session:${payload.sessionId}`);
      }
      if (payload.toolCallId !== undefined && payload.toolCallId !== null) {
        parts.push(`toolCall:${payload.toolCallId}`);
      }
      if (payload.timestamp !== undefined && payload.timestamp !== null) {
        parts.push(`ts:${payload.timestamp}`);
      }
      if (parts.length > 1) {
        dedupKey = parts.join('|');
      }
    }

    if (dedupKey) {
      if (this._seenEventIds.has(dedupKey)) return;
      this._seenEventIds.add(dedupKey);
    }

    const eventId = payload.eventId || payload.id || crypto.randomUUID();
    const sessionId = payload.sessionId;
    const toolCallId = payload.toolCallId;
    const timestamp = payload.timestamp ?? Date.now();
    let causationId = null;
    let correlationId = null;

    if (type === 'session_start') {
      correlationId = eventId;
      if (sessionId) this._sessionRoots.set(sessionId, eventId);
    } else if (type === 'tool_call') {
      if (sessionId && this._sessionRoots.has(sessionId)) {
        correlationId = this._sessionRoots.get(sessionId);
        causationId = correlationId;
      }
      if (toolCallId) this._toolCalls.set(toolCallId, eventId);
    } else if (type === 'tool_result' || type === 'tool_error') {
      if (sessionId && this._sessionRoots.has(sessionId)) correlationId = this._sessionRoots.get(sessionId);
      if (toolCallId && this._toolCalls.has(toolCallId)) causationId = this._toolCalls.get(toolCallId);
    } else if (type === 'session_shutdown') {
      if (sessionId && this._sessionRoots.has(sessionId)) {
        correlationId = this._sessionRoots.get(sessionId);
        causationId = correlationId;
      }
    }

    const entry = { id: eventId, type, timestamp, correlationId, causationId, payload };
    if (type === 'tool_error') {
      entry.status = 'error';
      if (payload.error) entry.error = payload.error;
    } else if (payload.status) {
      entry.status = payload.status;
    }
    this.journal.append(entry);

    if (type === 'session_shutdown') {
      if (sessionId) {
        this._sessionRoots.delete(sessionId);
      } else {
        this._sessionRoots.clear();
      }
      this._toolCalls.clear();
    }
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._status = 'disposed';
    if (this._runtime && this._listeners.size > 0) {
      for (const [eventName, listener] of this._listeners.entries()) {
        this._runtime.removeListener(eventName, listener);
      }
      this._listeners.clear();
    }
    this._seenEventIds.clear();
    this._sessionRoots.clear();
    this._toolCalls.clear();
  }

  isDisposed() { return this._disposed; }
  getJournal() { return this.journal; }
  status() { return this._status; }
}

export default function(pi) {
  const tracer = new PiTracer();
  tracer.attach(pi);
  return tracer;
}
