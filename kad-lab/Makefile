# KAD-WP-001-INTENT-AUTHORITY-BOUNDARY — Makefile (deterministic; NO CMake/CTest)
CXX ?= g++
CXXFLAGS ?= -std=c++20 -O0 -Wall -Wextra -Werror -pedantic

SRC := src/kad/validator.cpp src/kad/resolver.cpp src/kad/state_diff.cpp
TEST := test/test_experiment001.cpp
HDR := src/kad/types.hpp src/kad/candidate.hpp src/kad/validated.hpp \
       src/kad/validator.hpp src/kad/resolver.hpp src/kad/state_diff.hpp
BIN := build/test_experiment001

.PHONY: all test clean

all: $(BIN)

$(BIN): $(SRC) $(TEST) $(HDR)
	@mkdir -p build
	$(CXX) $(CXXFLAGS) $(SRC) $(TEST) -o $(BIN)

test: $(BIN)
	./$(BIN)

clean:
	rm -rf build
