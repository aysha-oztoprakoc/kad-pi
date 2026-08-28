/** Explainable local-first capability router. No model/provider identity is required by policy. */
export class CapabilityRegistry {
  #resources = new Map();
  #observations = [];

  register(resource) {
    if (!resource?.id || !resource.capabilities?.length) throw new Error('resource id and capabilities are required');
    this.#resources.set(resource.id, { ...resource, available: resource.available !== false });
  }

  setAvailability(id, available, reason = 'observed state change') {
    const resource = this.#resources.get(id);
    if (!resource) return false;
    resource.available = Boolean(available);
    resource.availability_reason = reason;
    return true;
  }

  eligible(requirement) {
    return [...this.#resources.values()].filter(resource => resource.available &&
      requirement.trust_domain === resource.trust_domain &&
      (requirement.capabilities ?? []).every(capability => resource.capabilities.includes(capability)) &&
      (requirement.min_context ?? 0) <= (resource.context_window ?? 0));
  }

  choose(requirement) {
    const candidates = this.eligible(requirement);
    if (!candidates.length) return { status: 'DEGRADED', reason: 'no eligible capability', candidates: [] };
    candidates.sort((a, b) => {
      if (Boolean(a.deterministic) !== Boolean(b.deterministic)) return a.deterministic ? -1 : 1;
      if (Boolean(a.local) !== Boolean(b.local)) return a.local ? -1 : 1;
      return (a.priority ?? 0) - (b.priority ?? 0);
    });
    const selected = candidates[0];
    return { status: 'ROUTED', selected: selected.id, candidates: candidates.map(({ id }) => id) };
  }

  observe(observation) {
    if (!observation?.resource_id || typeof observation.accepted !== 'boolean') throw new Error('observation requires resource_id and accepted');
    this.#observations.push(Object.freeze({ ...observation, recorded_at: observation.recorded_at ?? new Date().toISOString() }));
  }

  observations() { return [...this.#observations]; }
  snapshot() { return [...this.#resources.values()].map(resource => ({ ...resource })); }
}
