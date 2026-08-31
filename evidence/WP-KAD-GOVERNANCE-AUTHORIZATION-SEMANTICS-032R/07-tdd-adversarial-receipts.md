# TDD and adversarial receipt evidence

RED: the new suite initially failed because V2 exports did not exist. GREEN: `node --test tools/kad/test/governance-v2.test.mjs tools/kad/test/governance.test.mjs tools/kad/test/governance-adversarial.test.mjs` passed 38/38. Coverage includes issuer/subject binding, tampering, scope attacks, expiry, rollback, safe release, legacy V1, forbidden operations, stale policy, and preflight integration.
