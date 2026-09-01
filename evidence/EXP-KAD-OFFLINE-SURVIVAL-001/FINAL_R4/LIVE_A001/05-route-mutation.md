# LIVE_A001-05 Route Mutation

Route mutation status: `NOT EXECUTED`.

The live guard was armed at `14:20:30 -03` with a 60-second delay, but the zero-time mutation gate was not reached before the guard fired at `14:21:33 -03`. The route-delete command was never run and no human mutation confirmation was requested.

Exact authorized command that was intentionally not executed:

```text
sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
```

Classification: `ABORTED_SAFE` before route mutation. No route deletion occurred.
