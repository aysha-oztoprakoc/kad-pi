/**
 * PON (Notification-Oriented Paradigm) Causal Reaction Engine.
 *
 * Implements the strict PON Causal Pathway:
 * State Mutation -> Fact Delta -> Evaluate Affected Premises Only -> Condition Evaluation -> Rule Activation -> ActionIntent Emission.
 *
 * Invariant: NOTIFY, DON'T POLL.
 * Invariant: Rules are NEVER scanned sequentially on turns; only affected premises are evaluated.
 */

export class PonEngine {
  constructor(options = {}) {
    this.rules = new Map(); // rule_id -> RuleDefinition
    this.factIndex = new Map(); // fact_key -> Set<rule_id>
    this.metrics = {
      total_fact_deltas: 0,
      evaluated_premises_count: 0,
      unaffected_rules_skipped: 0,
      activated_rules_count: 0,
      emitted_events_count: 0
    };
  }

  /**
   * Registers a reactive PON rule.
   *
   * @param {object} rule
   * @param {string} rule.id - Unique rule ID
   * @param {string} rule.name - Human-readable rule name
   * @param {Array<string>} rule.premises - Array of fact keys watched (e.g. ['entity:key:location', 'entity:player:location'])
   * @param {Function} rule.condition - (facts, worldState) => boolean
   * @param {Function} rule.action - (context) => object ActionIntent / Event
   */
  registerRule(rule) {
    if (!rule.id || !Array.isArray(rule.premises) || typeof rule.condition !== 'function') {
      throw new Error(`Invalid PON Rule specification for rule ${rule?.id}`);
    }

    this.rules.set(rule.id, rule);

    for (const premiseKey of rule.premises) {
      if (!this.factIndex.has(premiseKey)) {
        this.factIndex.set(premiseKey, new Set());
      }
      this.factIndex.get(premiseKey).add(rule.id);
    }
  }

  /**
   * Unregisters a rule and cleans up index bindings.
   * @param {string} ruleId
   */
  unregisterRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    for (const premiseKey of rule.premises) {
      const set = this.factIndex.get(premiseKey);
      if (set) {
        set.delete(ruleId);
        if (set.size === 0) {
          this.factIndex.delete(premiseKey);
        }
      }
    }
    this.rules.delete(ruleId);
  }

  /**
   * Evaluates affected premises and executes activated rules in response to a StateDiff.
   *
   * @param {Array<object>} stateDiff - Changes produced by deterministic Resolver
   * @param {object} worldState - Current authoritative WorldState
   * @param {object} [context] - Execution context (e.g. turn_id, causation_id)
   * @returns {Array<object>} Array of emitted domain events / reactive ActionIntents
   */
  processStateDiff(stateDiff, worldState, context = {}) {
    if (!Array.isArray(stateDiff) || stateDiff.length === 0) {
      return [];
    }

    const emittedEvents = [];
    const affectedRuleIds = new Set();

    // 1. Fact Delta Extraction & Selective Premise Resolution
    for (const change of stateDiff) {
      this.metrics.total_fact_deltas++;
      const exactKey = change.field;

      // Exact match
      if (this.factIndex.has(exactKey)) {
        for (const rId of this.factIndex.get(exactKey)) {
          affectedRuleIds.add(rId);
        }
      }

      // Wildcard / prefix match (e.g., 'entity:*:location')
      if (change.entity_id) {
        const wildcardKey = `entity:*:${change.field.split(':').pop()}`;
        if (this.factIndex.has(wildcardKey)) {
          for (const rId of this.factIndex.get(wildcardKey)) {
            affectedRuleIds.add(rId);
          }
        }
      }
    }

    // 2. Selectivity Metric: Unaffected rules skipped without evaluation
    const totalRules = this.rules.size;
    const evaluatedCount = affectedRuleIds.size;
    this.metrics.unaffected_rules_skipped += (totalRules - evaluatedCount);
    this.metrics.evaluated_premises_count += evaluatedCount;

    // 3. Condition Evaluation on Affected Rules Only
    for (const ruleId of affectedRuleIds) {
      const rule = this.rules.get(ruleId);
      if (!rule) continue;

      let conditionMet = false;
      try {
        conditionMet = rule.condition(stateDiff, worldState);
      } catch (err) {
        console.error(`Error evaluating condition for PON rule ${ruleId}:`, err);
        continue;
      }

      // 4. Rule Activation & ActionIntent / Event Emission
      if (conditionMet) {
        this.metrics.activated_rules_count++;
        try {
          const result = rule.action({
            stateDiff,
            worldState,
            context,
            ruleId: rule.id
          });

          if (result) {
            const events = Array.isArray(result) ? result : [result];
            for (const ev of events) {
              const enrichedEvent = {
                event_id: `pon:${ruleId}:${Date.now()}:${++this.metrics.emitted_events_count}`,
                source_rule: ruleId,
                causation_id: context.causation_id || 'state-diff-event',
                correlation_id: context.correlation_id || 'session-kad-main',
                timestamp_iso: new Date().toISOString(),
                ...ev
              };
              emittedEvents.push(enrichedEvent);
            }
          }
        } catch (err) {
          console.error(`Error executing action for PON rule ${ruleId}:`, err);
        }
      }
    }

    return emittedEvents;
  }

  /**
   * Returns current selectivity and execution metrics.
   * @returns {object}
   */
  getMetrics() {
    return { ...this.metrics };
  }
}
