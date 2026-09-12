.PHONY: all test test-pi-integration verify public-build models-sync csa clean

KAD_PI_SDK_ROOT ?= /tmp/wp-kad-001-sdk/runtime

all: test

verify:
	python3 validate_prime_directive.py
	node tools/kad/posture-check.mjs
	node tools/kad/preflight-gate.mjs
	bin/kad-wiki lint
	node tools/librarian/librarian.mjs verify

public-build:
	node bin/kad-publication build

# Re-sync the settings rows this repository declares from the running harness, and re-render the
# matrix's markdown view from the JSON. Run it after any project-declared setting changes.
models-sync:
	node tools/kad/settings-matrix.mjs

# Refresh the CSA's repository block: HEAD, branch, divergence and the dirty count, with the
# machine-appended paths excluded and declared rather than silently dropped.
csa:
	node tools/kad/csa-refresh.mjs


test: verify
	npm test
	$(MAKE) -C kad-lab test

test-pi-integration:
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node --test tools/kad/test/pi-real-persistent.integration.test.mjs
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node tools/kad/pi/run-pi-world.mjs

clean:
	$(MAKE) -C kad-lab clean
