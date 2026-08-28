import { createDeclarativeWorld, computeWorldHash, cloneWorldState, computeWorldDiff, applyWorldDiff } from './world-model.mjs';
import { PonEngine } from './pon-engine.mjs';
import { StcScope } from './stc-scope.mjs';
import { runTurn } from './orchestrator.mjs';
import { appendJournalEntry, generateCausalId } from './journal.mjs';

/**
 * Manages a persistent multi-turn world session with PON causal reactions and STC lifecycle ownership.
 */
export class PersistentSession {
  constructor(options = {}) {
    this.sessionId = options.sessionId || `session-wp003-${Date.now()}`;
    this.journalPath = options.journalPath || null;
    this.clock = options.clock || (() => new Date().toISOString());
    this.idFactory = options.idFactory || null;

    this.worldState = options.initialWorld ? cloneWorldState(options.initialWorld) : createDeclarativeWorld();
    this.turnIndex = 0;
    this.history = [];

    this.ponEngine = options.ponEngine || new PonEngine();
    this.stcScope = options.stcScope || new StcScope(`session-${this.sessionId}`);
  }

  /**
   * Executes a single multi-turn transition.
   *
   * @param {string|object} input
   * @param {object} [turnOptions]
   * @returns {object}
   */
  executeTurn(input, turnOptions = {}) {
    const currentTurn = ++this.turnIndex;
    const causationId = generateCausalId(`turn-${currentTurn}`, this.idFactory);
    const correlationId = this.sessionId;

    const originalStateBefore = cloneWorldState(this.worldState);
    const stateBeforeHash = computeWorldHash(originalStateBefore);
    const updatedState = cloneWorldState(originalStateBefore);

    // Map declarative world state to engine parameters
    const engineState = {
      player_room: originalStateBefore.entities.player?.location || 'room_a',
      key_room: originalStateBefore.entities.key?.held_by === 'player' ? 'held' : (originalStateBefore.entities.key?.location || 'room_a'),
      crate_room: originalStateBefore.entities.crate?.held_by === 'player' ? 'held' : (originalStateBefore.entities.crate?.location || 'room_b')
    };

    // Execute through deterministic authority boundary
    const result = runTurn(input, engineState, {
      ...turnOptions,
      causationId,
      correlationId,
      journalPath: null, // Session manages its own multi-turn journal format
      clock: this.clock,
      idFactory: this.idFactory
    });

    let ponReactions = [];
    let stateDiff = [];

    if (result.accepted) {
      // Synchronize declarative world state with authoritative outcome
      if (result.resolution.event_kind === 'PlayerMoved') {
        updatedState.entities.player.location = result.resolution.to;
      } else if (result.resolution.event_kind === 'ObjectAcquired') {
        const objId = result.validation.target;
        if (updatedState.entities[objId]) {
          updatedState.entities[objId].held_by = 'player';
          updatedState.entities[objId].location = 'held';
        }
      }

      this.worldState = updatedState;
      stateDiff = computeWorldDiff(originalStateBefore, this.worldState);
      if (stateDiff.length === 0 && result.state_diff.length > 0) {
        stateDiff = result.state_diff;
      }

      // Process PON Causal Reaction Graph (Affected Premises Only)
      ponReactions = this.ponEngine.processStateDiff(result.state_diff, this.worldState, {
        turn_index: currentTurn,
        causation_id: causationId,
        correlation_id: correlationId
      });
    }

    const stateAfterHash = computeWorldHash(this.worldState);

    // Multi-turn causal journal record
    const turnRecord = {
      turn_index: currentTurn,
      session_id: this.sessionId,
      causation_id: causationId,
      correlation_id: correlationId,
      timestamp_iso: this.clock(),
      input: typeof input === 'string' ? input : JSON.stringify(input),
      candidate_intent: result.candidate_intent,
      validation_status: result.status,
      validation: result.validation,
      resolution: result.resolution,
      state_before_hash: stateBeforeHash,
      state_diff: result.state_diff,
      state_after_hash: stateAfterHash,
      domain_event: result.domain_event,
      pon_reactions: ponReactions
    };

    if (this.journalPath) {
      appendJournalEntry(this.journalPath, turnRecord, {
        clock: this.clock,
        idFactory: this.idFactory,
        correlationId: this.sessionId
      });
    }

    this.history.push(turnRecord);

    return {
      turn_index: currentTurn,
      session_id: this.sessionId,
      accepted: result.accepted,
      status: result.status,
      input: turnRecord.input,
      candidate_intent: result.candidate_intent,
      resolution: result.resolution,
      state_before_hash: stateBeforeHash,
      state_diff: result.state_diff,
      state_after_hash: stateAfterHash,
      world_state: cloneWorldState(this.worldState),
      domain_event: result.domain_event,
      pon_reactions: ponReactions,
      turn_record: turnRecord
    };
  }

  /**
   * Disposes session and all registered STC effects in reverse order.
   */
  async dispose() {
    await this.stcScope.dispose();
  }
}
