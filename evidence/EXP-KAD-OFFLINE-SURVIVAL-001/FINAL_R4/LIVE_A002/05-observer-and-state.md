# R4-A002 Observer and State Evidence

Observer log SHA-256: `ba61d25a8642b4999b709679e974995cf002a14a913e01bfbc09fb4476fb2618`.

The observer remained active across pre-mutation healthy-state samples and terminated after its configured 180-second duration. It did not capture route absence or offline behavior because the mutation gate was missed.

Final deterministic state at `2026-08-31T15:07:27-03:00`:

```text
default via 192.168.0.1 dev enp7s0 proto dhcp src 192.168.0.3 metric 100
```

`enp7s0` remained `UP/LOWER_UP`; NetworkManager remained active; `Wired connection 1` remained active.
