import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  formatSseFrame,
  formatKeepAliveFrame,
  TelemetryStreamBroadcaster,
  TELEMETRY_STREAM_SCHEMA,
  PON_TELEMETRY_EVENTS
} from '../telemetry/stream-adapter.mjs';
import { createInterfaceServer } from '../interface-server.mjs';

test('WP-019: SSE wire framing formats IDs, event types, JSON data, and keep-alive heartbeats', () => {
  const frame = formatSseFrame({ status: 'HEALTHY' }, { id: '42', event: 'status-update', retry: 5000 });
  assert.ok(frame.includes('id: 42\n'));
  assert.ok(frame.includes('event: status-update\n'));
  assert.ok(frame.includes('retry: 5000\n'));
  assert.ok(frame.includes('data: {"status":"HEALTHY"}\n\n'));

  const keepAlive = formatKeepAliveFrame();
  assert.equal(keepAlive, ':keep-alive\n\n');
});

test('WP-019: TelemetryStreamBroadcaster manages client lifecycle and broadcasts typed PON transitions', () => {
  const broadcaster = new TelemetryStreamBroadcaster();
  assert.equal(broadcaster.activeClientsCount, 0);

  const sentChunks = [];
  const mockRes = {
    writeHead: (code, headers) => {
      mockRes.headers = headers;
      mockRes.statusCode = code;
    },
    write: (chunk) => {
      sentChunks.push(chunk);
      return true;
    },
    end: () => {
      mockRes.ended = true;
    },
    on: (evt, cb) => {}
  };

  const mockReq = {
    on: (evt, cb) => {
      if (evt === 'close') mockReq.closeCb = cb;
    }
  };

  // Add client
  broadcaster.addClient(mockReq, mockRes);
  assert.equal(broadcaster.activeClientsCount, 1);
  assert.equal(mockRes.statusCode, 200);
  assert.equal(mockRes.headers['content-type'], 'text/event-stream; charset=utf-8');
  assert.equal(mockRes.headers['cache-control'], 'no-cache, no-transform');

  // Verify initial greeting frame
  assert.ok(sentChunks.length >= 1);
  assert.ok(sentChunks[0].includes('event: connect'));
  assert.ok(sentChunks[0].includes('"seq":1'));

  // Broadcast typed PON notification
  broadcaster.broadcast(
    { node: 'host.tell.server', status: 'AVAILABLE' },
    { eventType: PON_TELEMETRY_EVENTS.NODE_AVAILABLE, ponTransition: 'NODE_AVAILABLE' }
  );

  assert.ok(sentChunks.length >= 2);
  const broadcastChunk = sentChunks[sentChunks.length - 1];
  assert.ok(broadcastChunk.includes('event: NODE_AVAILABLE'));
  assert.ok(broadcastChunk.includes('"schema":"kad-telemetry-stream-v1"'));
  assert.ok(broadcastChunk.includes('"seq":2'));
  assert.ok(broadcastChunk.includes('"pon_transition":"NODE_AVAILABLE"'));

  // Disconnect client
  mockReq.closeCb();
  assert.equal(broadcaster.activeClientsCount, 0);

  // Clean shutdown
  broadcaster.close();
});

test('WP-019: Interface server exposes GET /api/telemetry/stream and rejects mutating write methods', async () => {
  const instance = await createInterfaceServer({ host: '127.0.0.1', port: 0 });
  const { port } = instance.address;

  // 1. GET /api/telemetry/stream connects and receives initial handshake / events
  const streamReq = http.request({
    hostname: '127.0.0.1',
    port,
    path: '/api/telemetry/stream',
    method: 'GET'
  });

  const receivedData = [];
  const connectPromise = new Promise((resolve) => {
    streamReq.on('response', (res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'text/event-stream; charset=utf-8');
      res.on('data', (chunk) => {
        receivedData.push(chunk.toString());
        if (receivedData.length >= 1) {
          streamReq.destroy();
          resolve();
        }
      });
    });
  });

  streamReq.end();
  await connectPromise;

  // 2. Reject POST on /api/telemetry/stream (405 Method Not Allowed)
  const postPromise = new Promise((resolve) => {
    const postReq = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/telemetry/stream',
      method: 'POST'
    }, (res) => {
      assert.equal(res.statusCode, 405);
      resolve();
    });
    postReq.write(JSON.stringify({ cmd: 'MUTATE_ROUTE' }));
    postReq.end();
  });

  await postPromise;

  // 3. Static snapshot fallback /api/runtime-status remains fully operational
  const snapshotPromise = new Promise((resolve) => {
    http.get(`http://127.0.0.1:${port}/api/runtime-status`, (res) => {
      assert.equal(res.statusCode, 200);
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(body);
        assert.ok(parsed.schema);
        resolve();
      });
    });
  });

  await snapshotPromise;
  await instance.close();
});
