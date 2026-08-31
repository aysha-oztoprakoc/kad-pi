# Legacy V1 compatibility

V1 remains parseable and historically verifiable. `validateHumanAuthorizationReceiptV2` rejects V1 whenever delegated semantics are requested with `LEGACY_RECEIPT_DELEGATION_AMBIGUOUS`; no historical receipt is rewritten.
