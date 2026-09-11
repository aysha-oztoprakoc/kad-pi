# AMDY-001 — System Evidence

Evidence type: CONFIRMED (directly observed on this current installation)

Capture timestamp: 2026-08-25T03:40:35-03:00

## hostnamectl

```
  Static hostname: amdy
        Icon name: computer-desktop
          Chassis: desktop
Chassis Asset Tag: None
       Machine ID: 1199b5056f894262943ccd18ddcff6ec
          Boot ID: 51a6ae2c851e412fbf4105d85bd54879
 Operating System: Omarchy
           Kernel: Linux 7.1.8-arch1-3
     Architecture: x86-64
  Hardware Vendor: BAZAM PICHAU INFORMATICA LTDA
   Hardware Model: A620M
     Hardware SKU: None
 Firmware Version: 5.35
    Firmware Date: Wed 2025-12-31
     Firmware Age: 7month 3w 3d
```

## id

```
uid=1000(amdy) gid=1000(amdy) groups=1000(amdy),967(docker),992(input),998(wheel)
```

## uname -a

```
Linux amdy 7.1.8-arch1-3 #1 SMP PREEMPT_DYNAMIC Tue, 11 Aug 2026 09:16:08 +0000 x86_64 GNU/Linux
```

## /etc/os-release

```
NAME="Omarchy"
PRETTY_NAME="Omarchy"
ID=omarchy
ID_LIKE=arch
BUILD_ID="4.0.0"
VERSION_ID="4.0.0"
ANSI_COLOR="38;2;158;206;106"
HOME_URL="https://omarchy.org/"
DOCUMENTATION_URL="https://learn.omacom.io/2/the-omarchy-manual"
SUPPORT_URL="https://discord.gg/tXFUdasqhY"
BUG_REPORT_URL="https://github.com/basecamp/omarchy/issues"
LOGO=omarchy
```

## free -h

```
               total        used        free      shared  buff/cache   available
Mem:            14Gi       4.7Gi       958Mi       168Mi        10Gi        10Gi
Swap:           29Gi          0B        29Gi
```

## Notes

- No secret material intentionally recorded in this file.
- Machine ID / Boot ID are machine-identity metadata; keep this file local.
