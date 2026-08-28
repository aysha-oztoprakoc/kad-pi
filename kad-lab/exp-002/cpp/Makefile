# KAD-WP-002 — C++ Validator/Resolver CLI adapter (g++ -std=c++20, no deps)
CXX ?= g++
CXXFLAGS ?= -std=c++20 -O0 -Wall -Wextra -Werror -pedantic

SRC := kad_validator_cli.cpp ../../src/kad/validator.cpp ../../src/kad/resolver.cpp ../../src/kad/state_diff.cpp
BIN := ../build/kad_validator_cli

.PHONY: all test clean

all: $(BIN)

$(BIN): $(SRC) ../../src/kad/types.hpp ../../src/kad/candidate.hpp ../../src/kad/validated.hpp ../../src/kad/validator.hpp ../../src/kad/resolver.hpp ../../src/kad/state_diff.hpp
	@mkdir -p ../build
	$(CXX) $(CXXFLAGS) $(SRC) -o $(BIN)

clean:
	rm -f $(BIN)
