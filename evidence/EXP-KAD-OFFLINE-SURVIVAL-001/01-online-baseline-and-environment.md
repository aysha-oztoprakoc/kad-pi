# Online baseline and environment

Captured before any fault injection. Raw command receipts are in sibling `baseline-*.txt` files.

Timestamp (UTC): 2026-08-30T22:34:14.577036+00:00

[
  {
    "name": "git-state",
    "exit": 0,
    "bytes": 1453
  },
  {
    "name": "network-state",
    "exit": 0,
    "bytes": 550
  },
  {
    "name": "governance-status",
    "exit": 0,
    "bytes": 963
  },
  {
    "name": "governance-infrastructure-policy",
    "exit": 0,
    "bytes": 467
  },
  {
    "name": "kad-status",
    "exit": 0,
    "bytes": 23150
  },
  {
    "name": "kad-services",
    "exit": 0,
    "bytes": 23152
  },
  {
    "name": "kad-readiness",
    "exit": 0,
    "bytes": 4005
  },
  {
    "name": "telemetry-status",
    "exit": 0,
    "bytes": 814
  },
  {
    "name": "workctl-status",
    "exit": 0,
    "bytes": 123868
  },
  {
    "name": "local-model-registry",
    "exit": 0,
    "bytes": 7305
  }
]

The repository was already dirty before this experiment; see `baseline-git-state.txt` for the exact boundary.
