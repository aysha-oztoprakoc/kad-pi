# AMDY-001 — Storage Evidence

Evidence type: CONFIRMED (directly observed on this current installation)

Capture timestamp: 2026-08-25T03:40:42-03:00

## lsblk

```
NAME        PATH               SIZE FSTYPE      FSVER LABEL    UUID                                 MOUNTPOINTS              RO
sda         /dev/sda         931.5G                                                                                           0
└─sda1      /dev/sda1        931.5G ext4        1.0   amdy-HDD 9d31735a-9d6b-463a-8350-f039c8ecdc02 /run/media/amdy/amdy-HDD  0
sdb         /dev/sdb          57.7G                                                                                           0
├─sdb1      /dev/sdb1         57.7G exfat       1.0   Ventoy   4E21-0000                            /run/media/amdy/Ventoy    0
└─sdb2      /dev/sdb2           32M vfat        FAT16 VTOYEFI  EA6C-95B2                            /run/media/amdy/VTOYEFI   0
zram0       /dev/zram0        14.7G swap        1     zram0    0e951ea3-a5d9-47a9-a215-34795c618a01 [SWAP]                    0
nvme0n1     /dev/nvme0n1     931.5G                                                                                           0
├─nvme0n1p1 /dev/nvme0n1p1       2G vfat        FAT32          A64C-53DF                            /boot                     0
└─nvme0n1p2 /dev/nvme0n1p2   929.5G crypto_LUKS 2              e607bec0-f935-4e53-afd7-e47744023483                           0
  └─root    /dev/mapper/root 929.5G btrfs                      4dfc9e4d-2add-49b4-ae3e-2953a15cc0f2 /var/log                  0
                                                                                                    /home
                                                                                                    /var/cache/pacman/pkg
                                                                                                    /
```

## amdy-HDD identity (CONFIRMED)

- device: /dev/sda
- partition: /dev/sda1
- filesystem: ext4 (FSVER 1.0)
- label: amdy-HDD
- UUID: 9d31735a-9d6b-463a-8350-f039c8ecdc02
- size: 931.5G
- mountpoint: /run/media/amdy/amdy-HDD
- mount mode: RW (RO=0, udisks automount)
- mount options (from findmnt): rw,nosuid,nodev,relatime,errors=remount-ro

HDD file contents were NOT accessed during this capture. Only block-device/mount metadata was observed.

## findmnt (trimmed to material mounts)

```
TARGET                 SOURCE                    FSTYPE          OPTIONS
/                      /dev/mapper/root[/@]      btrfs           rw,relatime,compress=zstd:3,ssd,space_cache=v2,subvolid=256,subvol=/@
/var/cache/pacman/pkg  /dev/mapper/root[/@pkg]   btrfs           rw,relatime,compress=zstd:3,ssd,space_cache=v2,subvolid=259,subvol=/@pkg
/home                  /dev/mapper/root[/@home]  btrfs           rw,relatime,compress=zstd:3,ssd,space_cache=v2,subvolid=257,subvol=/@home
/var/log               /dev/mapper/root[/@log]   btrfs           rw,relatime,compress=zstd:3,ssd,space_cache=v2,subvolid=258,subvol=/@log
/boot                  /dev/nvme0n1p1            vfat            rw,relatime,fmask=0077,dmask=0077,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro
/run/media/amdy/Ventoy /dev/sdb1                 exfat           rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0022,dmask=0022,iocharset=utf8,errors=remount-ro
/run/media/amdy/VTOYEFI /dev/sdb2                vfat            rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,showexec,utf8,flush,errors=remount-ro
/run/media/amdy/amdy-HDD /dev/sda1               ext4            rw,nosuid,nodev,relatime,errors=remount-ro
```

Note: root is LUKS-encrypted btrfs with subvolumes @, @home, @log, @pkg.

## df -hT

```
Filesystem       Type      Size  Used Avail Use% Mounted on
dev              devtmpfs  7.3G     0  7.3G   0% /dev
run              tmpfs     7.4G  1.8M  7.4G   1% /run
efivarfs         efivarfs  128K   20K  104K  16% /sys/firmware/efi/efivars
/dev/mapper/root btrfs     930G   28G  901G   3% /
tmpfs            tmpfs     7.4G  76M  7.3G   2% /dev/shm
none             tmpfs     1.0M     0  1.0M   0% /run/credentials/systemd-journald.service
none             tmpfs     1.0M     0  1.0M   0% /run/credentials/systemd-resolved.service
tmpfs            tmpfs     7.4G  65M  7.4G   1% /tmp
/dev/mapper/root btrfs     930G   28G  901G   3% /var/cache/pacman/pkg
/dev/mapper/root btrfs     930G   28G  901G   3% /home
/dev/mapper/root btrfs     930G   28G  901G   3% /var/log
/dev/nvme0n1p1   vfat      2.0G  145M  1.9G   8% /boot
tmpfs            tmpfs     1.5G  1.2M  1.5G   1% /run/user/1000
/dev/sdb1        exfat      58G   33G   26G  56% /run/media/amdy/Ventoy
/dev/sdb2        vfat       32M   28M  4.6M  86% /run/media/amdy/VTOYEFI
/dev/sda1        ext4      916G  179G  691G  21% /run/media/amdy/amdy-HDD
```

## swapon --show

```
NAME           TYPE       SIZE USED PRIO
/swap/swapfile file      14.7G   0B    0
/dev/zram0     partition 14.7G   0B  100
```

## Notes

- Swap = /swap/swapfile (btrfs file) + /dev/zram0. Resolves prior UNKNOWN about swap source.
- No secret material intentionally recorded in this file.
