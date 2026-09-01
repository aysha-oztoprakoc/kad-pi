#!/usr/bin/env bash
set -euo pipefail

OBSERVER_UNIT='kad-offline-survival-r4-a003-live-exec-observer.service'
GUARD_UNIT='kad-offline-survival-r4-a003-live-exec-rollback'
EXPECTED_SECONDS=180
MIN_REMAINING=120
MAX_MUTATION_DELAY=15

abort() { printf 'ABORT_WITHOUT_MUTATION\t%s\n' "$1" >&2; exit 90; }

observer_state="$(systemctl --user show "$OBSERVER_UNIT" --property=ActiveState --value)"
observer_substate="$(systemctl --user show "$OBSERVER_UNIT" --property=SubState --value)"
[ "$observer_state" = active ] && [ "$observer_substate" = running ] || abort 'observer not ACTIVE/RUNNING'
observer_started="$(systemctl --user show "$OBSERVER_UNIT" --property=ActiveEnterTimestamp --value)"
observer_start_epoch="$(date -d "$observer_started" +%s)" || abort 'observer start timestamp unavailable'
now_epoch="$(date +%s)"
observer_remaining=$((observer_start_epoch + EXPECTED_SECONDS - now_epoch))
[ "$observer_remaining" -ge "$MIN_REMAINING" ] || abort "observer remaining ${observer_remaining}s < ${MIN_REMAINING}s"

sudo /usr/bin/systemd-run --unit="$GUARD_UNIT" --on-active=60s --collect --property=TimeoutStartSec=15s /usr/bin/nmcli device reapply enp7s0
[ "$(systemctl show "$GUARD_UNIT.timer" --property=ActiveState --value)" = active ] || abort 'rollback timer not ACTIVE'
[ "$(systemctl show "$GUARD_UNIT.timer" --property=SubState --value)" = waiting ] || abort 'rollback timer not WAITING'

guard_started="$(systemctl show "$GUARD_UNIT.timer" --property=ActiveEnterTimestamp --value)"
guard_epoch="$(date -d "$guard_started" +%s)" || abort 'guard arming timestamp unavailable'
printf 'T_GUARD_ARMED\t%s\n' "$guard_started"

now_epoch="$(date +%s)"
[ $((now_epoch - guard_epoch)) -le "$MAX_MUTATION_DELAY" ] || abort 'guard-to-mutation deadline exceeded'

routes="$(ip -4 route show default)"
[ "$(printf '%s\n' "$routes" | wc -l)" -eq 1 ] || abort 'default route count mismatch'
case "$routes" in
  *'default via 192.168.0.1 dev enp7s0 proto dhcp'*'metric 100'*) ;;
  *) abort 'zero-time route predicate mismatch' ;;
esac

sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
printf 'T_ROUTE_DELETE_COMMAND\t%s\n' "$(date --iso-8601=seconds)"
route_after="$(ip -4 route show default)"
[ -z "$route_after" ] || abort 'authorized default route was not absent after deletion'
printf 'T_ROUTE_ABSENT\t%s\n' "$(date --iso-8601=seconds)"
