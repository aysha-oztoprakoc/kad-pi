# R4-A003-01 Human Terminal Preparation

This is a pre-critical-section preparation requirement, not execution authorization.

Before Phase B, the project lead must use the local terminal to perform normal interactive sudo authentication with:

```text
sudo -v
```

The password is entered only by the human in the local terminal. The agent must not request, receive, store, echo, or type the password. No sudoers change, NOPASSWD rule, persistent credential, or broader privilege is created.

The human terminal must have the exact already-authorized deletion command ready:

```text
sudo /usr/bin/ip -4 route del default via 192.168.0.1 dev enp7s0 proto dhcp metric 100
```

After `T_GUARD_ARMED`, the deterministic GO signal is coordination only. No new authorization Ask occurs. If the human cannot execute the exact command within 15 seconds, the attempt aborts without route mutation.
