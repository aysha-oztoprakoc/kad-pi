# Adversarial review

1. Task budget is not runtime capability: detected by tests and comparison.
2. OMP declaration is not Pi runtime truth: OMP 4096/256 conflicts with Pi/capture.
3. Pi declaration is not Kobold truth: runtime context remains only configured while transport max_tokens is captured.
4. 192 output is saturation only because captured max_tokens=192; finish reason remains UNKNOWN for R2.
5. Tokenizer component split is not exact; total R2 usage is archived.
6. UNKNOWN limits fail conservatively in preflight.
7. Larger context does not change trust/capability.
8. PAYG/economic route test unchanged.
9. Request capture fixture used local HTTP SSE and zero model inference.
10. No max() normalization was used.
