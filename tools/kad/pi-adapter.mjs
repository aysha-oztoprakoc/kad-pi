import { runTurn } from './orchestrator.mjs';

/**
 * Mounts the single-turn KAD world turn engine onto a Pi SDK AgentSession.
 *
 * @param {object} param0
 * @param {object} param0.session - Pi SDK AgentSession
 * @param {object} [param0.context] - Cordis Context
 * @param {object} [param0.fiber] - Cordis Fiber instance
 * @param {object} [param0.initialState] - Canonical GameState
 * @param {Function} [param0.onTurnComplete] - Callback on turn resolution
 * @returns {object} { getCurrentState, dispose }
 */
export function mountPiTurnAdapter({
  session,
  context,
  fiber,
  initialState = null,
  onTurnComplete = null
}) {
  let active = true;
  let currentState = initialState;
  let lastProcessedIndex = -1;

  const onQueueUpdate = (event) => {
    if (!active || event?.type !== 'queue_update') return;

    if (!Array.isArray(event.steering) || event.steering.length === 0) return;
    if (Array.isArray(event.followUp) && event.followUp.length > 0) return;

    if (event.steering.length === 1) {
      lastProcessedIndex = 0;
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
      return;
    }

    while (lastProcessedIndex + 1 < event.steering.length) {
      lastProcessedIndex++;
      const steeringItem = event.steering[lastProcessedIndex];
      const text = typeof steeringItem === 'string' ? steeringItem : (steeringItem?.content || steeringItem?.text);
      if (!text) continue;

      const result = runTurn(text, currentState);
      currentState = result.state_after;

      if (onTurnComplete) {
        try {
          onTurnComplete(result);
        } catch (err) {
          console.error('Error in onTurnComplete callback:', err);
        }
      }
    }
  };

  let unsubscriptionEffect = null;
  if (fiber && typeof fiber.effect === 'function') {
    unsubscriptionEffect = fiber.effect(
      () => session.subscribe(onQueueUpdate),
      'kad-pon.pi-sdk-subscription'
    );
  } else {
    const rawUnsub = session.subscribe(onQueueUpdate);
    unsubscriptionEffect = async () => {
      if (typeof rawUnsub === 'function') {
        rawUnsub();
      }
    };
  }

  const disposeHandler = async () => {
    if (!active) return;
    active = false;
    if (typeof unsubscriptionEffect === 'function') {
      await unsubscriptionEffect();
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

/**
 * Mounts a PersistentSession onto a Pi SDK AgentSession with STC / Cordis lifecycle ownership.
 *
 * @param {object} param0
 * @param {object} param0.session - Pi SDK AgentSession
 * @param {object} [param0.context] - Cordis Context
 * @param {object} [param0.fiber] - Cordis Fiber instance
 * @param {PersistentSession} param0.persistentSession - PersistentSession instance
 * @param {Function} [param0.onTurnComplete] - Callback on turn resolution
 * @returns {object} { getSession, dispose }
 */
export function mountPiPersistentSessionAdapter({
  session,
  context,
  fiber,
  persistentSession,
  onTurnComplete = null
}) {
  let active = true;
  let lastProcessedIndex = -1;

  const onQueueUpdate = (event) => {
    if (!active || event?.type !== 'queue_update') return;

    if (!Array.isArray(event.steering) || event.steering.length === 0) return;
    if (Array.isArray(event.followUp) && event.followUp.length > 0) return;

    if (event.steering.length === 1) {
      lastProcessedIndex = 0;
      const steeringItem = event.steering[0];
      const text = typeof steeringItem === 'string' ? steeringItem : (steeringItem?.content || steeringItem?.text);
      if (!text) return;

      const result = persistentSession.executeTurn(text);
      if (onTurnComplete) {
        try {
          onTurnComplete(result);
        } catch (err) {
          console.error('Error in persistent onTurnComplete callback:', err);
        }
      }
      return;
    }

    while (lastProcessedIndex + 1 < event.steering.length) {
      lastProcessedIndex++;
      const steeringItem = event.steering[lastProcessedIndex];
      const text = typeof steeringItem === 'string' ? steeringItem : (steeringItem?.content || steeringItem?.text);
      if (!text) continue;

      const result = persistentSession.executeTurn(text);

      if (onTurnComplete) {
        try {
          onTurnComplete(result);
        } catch (err) {
          console.error('Error in persistent onTurnComplete callback:', err);
        }
      }
    }
  };

  let unsubscriptionEffect = null;
  if (fiber && typeof fiber.effect === 'function') {
    unsubscriptionEffect = fiber.effect(
      () => session.subscribe(onQueueUpdate),
      'kad-pon.pi-persistent-subscription'
    );
  } else {
    const rawUnsub = session.subscribe(onQueueUpdate);
    unsubscriptionEffect = async () => {
      if (typeof rawUnsub === 'function') {
        rawUnsub();
      }
    };
  }

  const disposeHandler = async () => {
    if (!active) return;
    active = false;
    if (typeof unsubscriptionEffect === 'function') {
      await unsubscriptionEffect();
    }
    await persistentSession.dispose();
  };

  if (context && typeof context.on === 'function') {
    context.on('dispose', disposeHandler);
  }

  return {
    getSession: () => persistentSession,
    dispose: disposeHandler
  };
}
