import os
import re
import sys

file_path = "/home/amdy/Work/PRIME_DIRECTIVE.md"

if not os.path.exists(file_path):
    print("Error: PRIME_DIRECTIVE.md not found.")
    sys.exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Validation: Check for required sections
required_sections = [
    "1. Purpose and Epistemic Status",
    "2. Core Vocabulary",
    "3. PON Directives",
    "4. STC Directives",
    "5. TDD Directives",
    "6. Graceful Degradation Directives",
    "7. Agent/Harness Directives",
    "8. Scientific Directives",
    "9. Global STOP Conditions",
    "10. Canonical Execution Loop"
]

missing_sections = []
for section in required_sections:
    if section not in content:
        missing_sections.append(section)

if missing_sections:
    print(f"Error: Missing sections: {', '.join(missing_sections)}")
    sys.exit(1)

# 2. Validation: Check for placeholders
placeholders = re.findall(r'\[TODO\]|\[INSERT.*?\]|\<TODO.*?\>', content)
if placeholders:
    print(f"Error: Unresolved placeholders found: {placeholders}")
    sys.exit(1)

# 3. Measurement: Bytes, Words, Lines, Token Estimate
bytes_count = len(content.encode('utf-8'))
words_count = len(content.split())
lines_count = len(content.splitlines())

# Approximation: 1 token ~= 0.75 words, so tokens ~= words / 0.75
token_estimate = int(words_count / 0.75)

print("VALIDATION SUCCESS")
print("==================")
print(f"Bytes: {bytes_count}")
print(f"Words: {words_count}")
print(f"Lines: {lines_count}")
print(f"Estimated Tokens: {token_estimate}")

if token_estimate > 1500:
    print("Warning: Token estimate exceeds 1500 budget.")
else:
    print("Token budget check passed (<= 1500 tokens).")
