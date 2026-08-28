/**
 * STC (Spatiotemporal Composability) Scope & Managed Effect Lifecycle.
 *
 * Invariant: Every temporal effect must register an explicit inverse.
 * Invariant: Deactivation unwinds registered effects in strict reverse order of activation (LIFO).
 */

export class StcScope {
  constructor(name = 'root', parent = null) {
    this.name = name;
    this.parent = parent;
    this.children = new Set();
    this.effects = []; // Array<{ label: string, inverse: () => Promise<void>|void, timestamp: number }>
    this.active = true;

    if (parent) {
      parent.children.add(this);
    }
  }

  /**
   * Creates a nested child scope under this scope.
   * @param {string} name
   * @returns {StcScope}
   */
  createChild(name) {
    if (!this.active) {
      throw new Error(`Cannot create child scope under inactive scope "${this.name}"`);
    }
    return new StcScope(name, this);
  }

  /**
   * Registers a managed effect with an explicit inverse cleanup closure.
   *
   * @param {string} label - Human/audit label describing the effect
   * @param {Function} inverse - () => Promise<void> | void teardown closure
   * @returns {Function} Manual dispose closure for this single effect
   */
  registerEffect(label, inverse) {
    if (!this.active) {
      throw new Error(`Cannot register effect "${label}" on inactive scope "${this.name}"`);
    }
    if (typeof inverse !== 'function') {
      throw new Error(`Effect "${label}" must provide an inverse teardown function`);
    }

    const effectRecord = {
      label,
      inverse,
      timestamp: Date.now()
    };

    this.effects.push(effectRecord);

    return async () => {
      const idx = this.effects.indexOf(effectRecord);
      if (idx !== -1) {
        this.effects.splice(idx, 1);
        await effectRecord.inverse();
      }
    };
  }

  /**
   * Disposes this scope and all registered effects in strict reverse order (LIFO).
   * Also cascades teardown to child scopes.
   */
  async dispose() {
    if (!this.active) return;
    this.active = false;

    // 1. Tear down children first (dependents before dependencies)
    for (const child of Array.from(this.children).reverse()) {
      await child.dispose();
    }
    this.children.clear();

    // 2. Unwind registered effects in strict reverse order of activation
    while (this.effects.length > 0) {
      const effect = this.effects.pop();
      try {
        await effect.inverse();
      } catch (err) {
        console.error(`Error unwinding effect "${effect.label}" in scope "${this.name}":`, err);
      }
    }

    if (this.parent) {
      this.parent.children.delete(this);
    }
  }

  /**
   * Returns active effect count.
   * @returns {number}
   */
  get activeEffectsCount() {
    return this.effects.length;
  }
}
