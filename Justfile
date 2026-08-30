# KAD-PI Justfile - Reproducible Developer & Control Plane Tasks

default: verify

# Run primary deterministic verification
verify:
	python3 validate_prime_directive.py
	node tools/librarian/librarian.mjs verify
	bin/workctl doctor
	bin/kad doctor

# Run full test suite including research and control-plane suites
test: verify
	node --test tools/kad/test/telemetry.test.mjs tools/kad/test/control-plane.test.mjs
	node --test tools/kad/test/research*.test.mjs
	node --test tools/workspace/workctl.test.mjs
	node --test tools/workspace/skill-governance.test.mjs tools/workspace/workflow-bridge.test.mjs
	node --test tools/librarian/test/librarian.test.mjs
	node --test .agents/capabilities/ask_user/contract_test.mjs

# Run deterministic security gates (Gitleaks, Trivy)
security:
	gitleaks detect --no-git --verbose --source . --redact || true
	trivy fs --scanners vuln,secret --severity HIGH,CRITICAL . || true

# Run shell and structural linting
lint:
	shellcheck bin/kad bin/kad-doctor bin/kad-knowledge bin/kad-runtime-status bin/workctl || true
	shfmt -d bin/ || true

# Benchmark KAD CLI startup overhead using hyperfine
bench:
	hyperfine --warmup 3 'bin/kad status --json' 'bin/kad doctor'

# Show live KAD control plane status
status:
	bin/kad status

# Run KAD diagnostic doctor
doctor:
	bin/kad doctor
