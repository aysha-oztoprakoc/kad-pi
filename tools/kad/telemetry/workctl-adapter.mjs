import fs from 'node:fs';
import path from 'node:path';

export function readWorkspaceWorkState(cwd = process.cwd()) {
  const workDir = path.join(cwd, '.agents', 'work');
  const claimsDir = path.join(workDir, 'claims');

  let activeClaim = null;
  const frontier = [];
  const accepted = [];
  const blocked = [];

  try {
    if (fs.existsSync(claimsDir)) {
      const claimFiles = fs.readdirSync(claimsDir).filter((f) => f.endsWith('.json'));
      for (const file of claimFiles) {
        try {
          const claim = JSON.parse(fs.readFileSync(path.join(claimsDir, file), 'utf8'));
          if (claim && claim.active !== false) {
            activeClaim = claim;
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    if (fs.existsSync(workDir)) {
      const ticketFiles = fs.readdirSync(workDir).filter((f) => f.endsWith('.json'));
      for (const file of ticketFiles) {
        try {
          const ticket = JSON.parse(fs.readFileSync(path.join(workDir, file), 'utf8'));
          if (ticket.status === 'READY') frontier.push(ticket.id);
          else if (ticket.status === 'ACCEPTED') accepted.push(ticket.id);
          else if (ticket.status === 'BLOCKED') blocked.push(ticket.id);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // fallback
  }

  return {
    activeClaim,
    frontier,
    accepted,
    blocked,
  };
}

export function createWorkctlViewModel({
  activeClaim = null,
  frontier = [],
  accepted = [],
  blocked = [],
} = {}) {
  const hasActiveClaim = Boolean(activeClaim && (activeClaim.task || activeClaim.claim_id));
  const ticketId = hasActiveClaim ? activeClaim.task || activeClaim.id : 'NO ACTIVE CLAIM';

  return {
    has_active_claim: hasActiveClaim,
    ticket_id: ticketId,
    actor_label: activeClaim?.actor_label ?? null,
    mode: activeClaim?.mode ?? null,
    started_at: activeClaim?.started_at ?? null,
    owned_paths: activeClaim?.owned_paths ?? [],
    frontier: Array.isArray(frontier) ? frontier : [],
    accepted: Array.isArray(accepted) ? accepted : [],
    blocked: Array.isArray(blocked) ? blocked : [],
  };
}
