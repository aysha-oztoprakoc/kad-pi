/** Mount the deliberately small, fail-closed Pi queue projection. */
export function mountKadPon({
  session,
  fiber,
  condition,
  rule,
  sink,
  journal,
  onAdapterCallback,
  onNotification,
  onCondition,
}) {
  let sequence = 0;
  let active = true;

  const append = (stage, value = {}) => journal.push({ stage, ...value });

  const onQueueUpdate = (event) => {
    if (!active || event?.type !== 'queue_update') return;
    onAdapterCallback?.();
    // Pi retains queued steering messages. Only a single fresh steering item
    // is the narrow event represented by this adapter; accumulated queues are
    // intentionally outside this contract's causal path.
    if (!Array.isArray(event.steering) || event.steering.length !== 1
      || (Array.isArray(event.followUp) && event.followUp.length !== 0)) return;

    const id = `pi-event:${++sequence}`;
    const correlationId = `pi-correlation:${sequence}`;
    append('pi_sdk_event', { id, event });
    const notification = {
      id: `kad-notification:${sequence}`,
      type: 'pi.queue_update',
      source: 'pi-sdk-0.84.3',
      payload: { steering: [...event.steering] },
      causationId: undefined,
      correlationId,
    };
    append('kad_notification', { notification });
    onNotification?.(notification);

    let matches;
    try {
      matches = Boolean(condition(notification));
    } catch (error) {
      append('condition_failure', { notification, error });
      return;
    }
    append('condition_evaluation', { notification, result: matches });
    onCondition?.(matches);
    if (!matches) return;

    let intent;
    try {
      intent = rule(notification);
      append('rule_result', { notification, intent });
    } catch (error) {
      append('rule_failure', { notification, error });
      return;
    }
    append('action_intent', { notification, intent });
    try {
      const outcome = sink(intent);
      append('sink_outcome', { notification, intent, outcome });
    } catch (error) {
      append('sink_failure', { notification, intent, error });
    }
  };

  const subscription = fiber.effect(
    () => session.subscribe(onQueueUpdate),
    'kad-pon.pi-sdk-subscription',
  );

  return {
    async dispose() {
      if (!active) return;
      active = false;
      await subscription();
    },
  };
}
