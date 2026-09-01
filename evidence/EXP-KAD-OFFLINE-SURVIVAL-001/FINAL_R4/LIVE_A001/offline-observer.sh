#!/usr/bin/env bash
set -u

ROOT="${ROOT:-/home/amdy/Work}"
OUT="${1:?output path required}"
DURATION="${2:-60}"
INTERVAL="${3:-5}"
START="$(date --iso-8601=seconds)"
END_EPOCH=$(( $(date +%s) + DURATION ))

mkdir -p "$(dirname "$OUT")"
printf 'observer_start\t%s\n' "$START" >> "$OUT"
printf 'observer_duration_seconds\t%s\n' "$DURATION" >> "$OUT"
printf 'observer_interval_seconds\t%s\n' "$INTERVAL" >> "$OUT"

while [ "$(date +%s)" -le "$END_EPOCH" ]; do
  ts="$(date --iso-8601=seconds)"
  route=$(/usr/bin/ip -details -4 route show default 2>&1 | tr '\n' ' ')
  link=$(/usr/bin/ip link show dev enp7s0 2>&1 | tr '\n' ' ')
  addr=$(/usr/bin/ip -4 addr show dev enp7s0 2>&1 | tr '\n' ' ')
  lan=FAIL
  /usr/bin/timeout 2 /usr/bin/ping -c 1 -W 1 192.168.0.1 >/dev/null 2>&1 && lan=PASS
  external=FAIL
  /usr/bin/timeout 3 /usr/bin/ping -c 1 -W 2 1.1.1.1 >/dev/null 2>&1 && external=PASS
  localhost=FAIL
  /usr/bin/timeout 3 /usr/bin/curl --fail --silent --show-error --max-time 2 http://127.0.0.1:5001/v1/models >/dev/null 2>&1 && localhost=PASS
  workctl=FAIL
  (cd "$ROOT" && /usr/bin/timeout 4 ./bin/workctl status >/dev/null 2>&1) && workctl=PASS
  kad=FAIL
  (cd "$ROOT" && /usr/bin/timeout 4 ./bin/kad status --json >/dev/null 2>&1) && kad=PASS
  omp=ABSENT
  /usr/bin/pgrep -f '(^|/)omp($| )' >/dev/null 2>&1 && omp=PRESENT
  pi=ABSENT
  command -v pi >/dev/null 2>&1 && pi=PRESENT
  telemetry=FAIL
  (cd "$ROOT" && /usr/bin/timeout 4 ./bin/kad telemetry --json >/dev/null 2>&1) && telemetry=PASS
  printf 'sample\t%s\tdefault_route=%s\tlink=%s\taddress=%s\tlan=%s\texternal=%s\tlocalhost=%s\tworkctl=%s\tkad=%s\tomP=%s\tpi=%s\ttelemetry=%s\n' "$ts" "$route" "$link" "$addr" "$lan" "$external" "$localhost" "$workctl" "$kad" "$omp" "$pi" "$telemetry" >> "$OUT"
  [ "$(date +%s)" -ge "$END_EPOCH" ] && break
  sleep "$INTERVAL"
done
printf 'observer_end\t%s\n' "$(date --iso-8601=seconds)" >> "$OUT"
