# KAD-WP-001-INTENT-AUTHORITY-BOUNDARY — Makefile (deterministic; NO CMake/CTest)
CXX ?= g++
CXXFLAGS ?= -std=c++20 -O0 -Wall -Wextra -Werror -pedantic

SRC := src/kad/validator.cpp src/kad/resolver.cpp src/kad/state_diff.cpp
TEST := test/test_experiment001.cpp
CLI_SRC := src/kad/cli_main.cpp
HDR := src/kad/types.hpp src/kad/candidate.hpp src/kad/validated.hpp \
       src/kad/validator.hpp src/kad/resolver.hpp src/kad/state_diff.hpp
BIN := build/test_experiment001
CLI_BIN := build/kad_engine_cli

.PHONY: all test clean cli

all: $(BIN) $(CLI_BIN)

$(BIN): $(SRC) $(TEST) $(HDR)
	@mkdir -p build
	$(CXX) $(CXXFLAGS) $(SRC) $(TEST) -o $(BIN)

$(CLI_BIN): $(SRC) $(CLI_SRC) $(HDR)
	@mkdir -p build
	$(CXX) $(CXXFLAGS) $(SRC) $(CLI_SRC) -o $(CLI_BIN)

cli: $(CLI_BIN)

test: $(BIN) $(CLI_BIN)
	./$(BIN)

clean:
	rm -rf build
