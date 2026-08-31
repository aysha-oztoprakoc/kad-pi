# Rollback and safe de-escalation

Primary actions stop at `action_valid_until`. Exact rollback remains valid only through `recovery_deadline`, with `authorized=true` and exact action matching. `claim.release` is accepted as safe de-escalation after primary expiry; unrelated cleanup is not. No redelegation is accepted.
