import { runTurn } from './orchestrator.mjs';

/**
 * Mounts the KAD world turn engine onto a Pi SDK AgentSession.
 *
 * @param {object} param0
 * @param {object} param0.session - Pi SDK AgentSession
 * @param {object} [param0.context] - Cordis Context / Fiber
 * @param {object} [param0.initialState] - Canonical GameState
 * @param {Function} [param0.onTurnComplete] - Callback on turn resolution
 * @returns {object} { dispose: () => Promise<void> }
 */
export function mountPiTurnAdapter({
  session,
  context,
  initialState = null,
  onTurnComplete = null
}) {
  let active = true;
  let currentState = initialState;

  const onQueueUpdate = (event) => {
    if (!active || event?.type !== 'queue_update') return;

    // Extract single fresh steering text from Pi SDK event
    if (!Array.isArray(event.steering) || event.steering.length === 0) return;
    const steeringItem = event.steering[0];
    const text = typeof steeringItem === 'string' ? steeringItem : (steeringItem?.content || steeringItem?.text);
    if (!text) return;

    const result = runTurn(text, currentState);
    currentState = result.state_after;

    if (onTurnComplete) {
      try {
        onTurnComplete(result);
      } catch (err) {
        console.error('Error in onTurnComplete callback:', err);
      }
    }
  };

  const unsubscribe = session.subscribe(onQueueUpdate);

  const disposeHandler = async () => {
    if (!active) return;
    active = false;
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };

  if (context && typeof context.on === 'function') {
    context.on('dispose', disposeHandler);
  }

  return {
    getCurrentState: () => currentState,
    dispose: disposeHandler
  };
}
