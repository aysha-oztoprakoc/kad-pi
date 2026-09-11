.PHONY: all test test-pi-integration verify public-build clean

KAD_PI_SDK_ROOT ?= /tmp/wp-kad-001-sdk/runtime

all: test

verify:
	python3 validate_prime_directive.py
	node tools/kad/posture-check.mjs
	bin/kad-wiki lint
	node tools/librarian/librarian.mjs verify

public-build:
	node bin/kad-publication build


test: verify
	npm test
	$(MAKE) -C kad-lab test

test-pi-integration:
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node --test tools/kad/test/pi-real-persistent.integration.test.mjs
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node tools/kad/pi/run-pi-world.mjs

clean:
	$(MAKE) -C kad-lab clean
