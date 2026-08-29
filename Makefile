.PHONY: all test test-pi-integration verify clean

KAD_PI_SDK_ROOT ?= /tmp/wp-kad-001-sdk/runtime

all: test

verify:
	python3 validate_prime_directive.py
	node tools/librarian/librarian.mjs verify

test: verify
	node --test tools/librarian/test/librarian.test.mjs
	node --test .agents/capabilities/ask_user/contract_test.mjs
	$(MAKE) -C kad-lab test
	node --test tools/kad/test/world-turn.test.mjs
	node --test tools/kad/test/multi-turn-pon.test.mjs
	node --test tools/kad/test/local-router.test.mjs
	node --test tools/kad/test/context-economy.test.mjs tools/kad/test/context-extension.test.mjs tools/kad/test/swarm-control-plane.test.mjs

test-pi-integration:
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node --test tools/kad/test/pi-real-persistent.integration.test.mjs
	KAD_PI_SDK_ROOT=$(KAD_PI_SDK_ROOT) node tools/kad/pi/run-pi-world.mjs

clean:
	$(MAKE) -C kad-lab clean
