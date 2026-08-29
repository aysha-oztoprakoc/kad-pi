# Adversarial review

- **Missing historical runtime:** rejected; loader no longer references `/tmp/wp-kad-001-sdk/runtime`.
- **Global or unrelated installed Pi:** rejected; there is no search-path loop, PATH lookup, or global package resolution.
- **Wrong package/version:** rejected before import.
- **Tarball substitution:** rejected by registry SHA-1, SHA-256, SHA-512, and npm integrity-derived SHA-512 checks.
- **Post-extraction tampering:** rejected by the repository-pinned artifact receipt, package-lock digest, complete package-file inventory, and per-file digests.
- **Symlink/special-file injection:** rejected during artifact inventory and verification.
- **Arbitrary explicit override:** rejected unless it has the same accepted artifact receipt.
- **Bootstrap partial failure:** staged installation is removed and the canonical location/repository manifest are not finalized.
- **Repeated bootstrap:** verified materialization returns the same canonical receipt without reinstalling.
- **Authority/economics regression:** no routing, trust, capability, validation, lifecycle, spend, quota, or acceptance code was changed; the full suite remained green.
