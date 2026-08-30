/**
 * Live PON/SSE Telemetry Streaming Transport & Adapter
 * Surface Profile: surface.web.sofia & surface.terminal.omarchy (ADR 0001, ADR 0004, ADR 0014)
 *
 * Invariants:
 * 1. Outbound observation only: zero direct incoming write/control mutation over SSE transport.
 * 2. Monotonically increasing sequence IDs, event typing, and keep-alive heartbeats.
 * 3. Bounded client resource isolation with immediate cleanup on disconnect (zero leaked sockets/listeners).
 * 4. Graceful fallback: clients can poll /api/runtime-status static snapshot if SSE is unavailable.
 */

export const TELEMETRY_STREAM_SCHEMA = 'kad-telemetry-stream-v1';

export const PON_TELEMETRY_EVENTS = Object.freeze({
  NODE_AVAILABLE: 'NODE_AVAILABLE',
  NODE_OFFLINE: 'NODE_OFFLINE',
  MODEL_READY: 'MODEL_READY',
  MODEL_UNLOADED: 'MODEL_UNLOADED',
  CAPABILITY_REMOVED: 'CAPABILITY_REMOVED',
  ROUTE_STALE: 'ROUTE_STALE',
  QUOTA_REFRESHED: 'QUOTA_REFRESHED',
  TELEMETRY_SNAPSHOT: 'TELEMETRY_SNAPSHOT'
});

/**
 * Formats a message into a standard Server-Sent Events wire frame.
 */
export function formatSseFrame(data, { id = null, event = null, retry = null } = {}) {
  let frame = '';
  if (id !== null && id !== undefined) frame += `id: ${id}\n`;
  if (event) frame += `event: ${event}\n`;
  if (retry !== null && retry !== undefined) frame += `retry: ${retry}\n`;

  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const lines = text.split('\n');
  for (const line of lines) {
    frame += `data: ${line}\n`;
  }
  frame += '\n';
  return frame;
}

/**
 * Generates an SSE keep-alive heartbeat comment frame.
 */
export function formatKeepAliveFrame() {
  return ':keep-alive\n\n';
}

/**
 * Manages active SSE observer connections and broadcasts typed PON transitions.
 */
export class TelemetryStreamBroadcaster {
  constructor({ heartbeatMs = 0 } = {}) {
    this.clients = new Set();
    this.seq = 0;
    this.heartbeatTimer = null;

    if (heartbeatMs > 0) {
      this.heartbeatTimer = setInterval(() => this.sendKeepAlive(), heartbeatMs);
      if (this.heartbeatTimer.unref) this.heartbeatTimer.unref();
    }
  }

  get activeClientsCount() {
    return this.clients.size;
  }

  /**
   * Registers a new HTTP client connection for SSE streaming.
   */
  addClient(request, response) {
    response.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no'
    });

    const initRecord = {
      schema: TELEMETRY_STREAM_SCHEMA,
      seq: ++this.seq,
      timestamp: new Date().toISOString(),
      event_type: 'CONNECTION_ESTABLISHED',
      message: 'KAD Live Telemetry SSE stream connected'
    };

    const initFrame = formatSseFrame(initRecord, { id: String(this.seq), event: 'connect', retry: 5000 });
    response.write(initFrame);

    this.clients.add(response);

    const cleanup = () => this.removeClient(response);
    if (request && typeof request.on === 'function') request.on('close', cleanup);
    if (response && typeof response.on === 'function') response.on('error', cleanup);
  }

  /**
   * Removes a disconnected client cleanly.
   */
  removeClient(response) {
    if (this.clients.has(response)) {
      this.clients.delete(response);
      try {
        if (!response.writableEnded) response.end();
      } catch {
        // Safe swallow on closed socket
      }
    }
  }

  /**
   * Broadcasts a typed PON state notification or telemetry record to all connected clients.
   */
  broadcast(payload, { eventType = 'TELEMETRY_SNAPSHOT', ponTransition = null } = {}) {
    const seq = ++this.seq;
    const record = {
      schema: TELEMETRY_STREAM_SCHEMA,
      seq,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      pon_transition: ponTransition,
      payload
    };

    const frame = formatSseFrame(record, { id: String(seq), event: eventType });

    for (const client of this.clients) {
      try {
        client.write(frame);
      } catch {
        this.removeClient(client);
      }
    }
  }

  /**
   * Sends keep-alive heartbeat comment frame to all active clients.
   */
  sendKeepAlive() {
    const frame = formatKeepAliveFrame();
    for (const client of this.clients) {
      try {
        client.write(frame);
      } catch {
        this.removeClient(client);
      }
    }
  }

  /**
   * Closes all active client connections and tears down timers.
   */
  close() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    for (const client of this.clients) {
      try {
        if (!client.writableEnded) client.end();
      } catch {
        // Safe swallow
      }
    }
    this.clients.clear();
  }
}
