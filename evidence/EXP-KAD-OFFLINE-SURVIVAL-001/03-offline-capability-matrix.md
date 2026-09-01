# Offline capability matrix

Offline phase was not entered. The following are **online baseline validation receipts only** and MUST NOT be promoted to offline evidence.

[
  {
    "command": "npm test",
    "exit": 0,
    "bytes": 64789
  },
  {
    "command": "bin/kad doctor",
    "exit": 0,
    "bytes": 759
  },
  {
    "command": "bin/workctl doctor",
    "exit": 0,
    "bytes": 1690
  },
  {
    "command": "bin/workctl skills doctor",
    "exit": 0,
    "bytes": 17995
  },
  {
    "command": "bin/kad-isa check all",
    "exit": 0,
    "bytes": 7452
  },
  {
    "command": "bin/kad-wiki lint",
    "exit": 0,
    "bytes": 28487
  },
  {
    "command": "bin/kad-intent validate",
    "exit": 0,
    "bytes": 418
  },
  {
    "command": "bin/kad-intent verify-report",
    "exit": 0,
    "bytes": 192
  },
  {
    "command": "bin/kad-telemetry validate",
    "exit": 0,
    "bytes": 1820
  },
  {
    "command": "bin/kad-governance status",
    "exit": 0,
    "bytes": 1766
  },
  {
    "command": "git diff --check",
    "exit": 0,
    "bytes": 26
  }
]

Capability verdicts: all offline capabilities `NOT_TESTED`; governance preflight blocking `VERIFIED_OFFLINE` only as a fail-closed control behavior observed before injection.
