---
title: "Installation Guide"
description: "Step-by-step guide to installing Lunar Linux from the daily ISO"
category: "installation"
order: 2
lastUpdated: 2026-11-22
tags: [installation, guide, setup]
relatedDocs: [requirements]
---

This guide walks you through installing Lunar Linux from the daily ISO. The installer is a text menu:
move with the arrow keys, or press the highlighted letter of an item, and confirm with Enter.

## Before You Begin

Make sure you have:
- Met the [system requirements](/docs/installation/requirements)
- Backed up any important data
- Downloaded the latest ISO from the [download page](/download), checked it against its SHA-256
  file, and written it to a USB drive (or attached it to a virtual machine)

## 1. Boot the ISO

Boot from the USB drive. What you see first depends on how your computer starts (its firmware):

- **BIOS (legacy):** the Lunar welcome text and a `boot:` prompt. **Enter** starts the installer (it
  also starts by itself after a minute), **F2** describes booting when you need special drivers
  loaded, and **F3** describes safe mode booting.
- **UEFI:** a short menu with the Lunar entry (ending in "UEFI USB") and "Reboot Into Firmware
  Interface". It boots the Lunar entry by itself after a few seconds.

The installer starts automatically once the system has booted; you don't need to log in or type a
command. Its first screen offers an introduction to Lunar Linux (**I**), a rescue shell (**X**) and
**F** to move one step forward. Every later screen has the same **F** (forward) and **B** (back).

## 2. System Defaults

Optional settings that make the system friendlier:

- **C** keyboard map
- **D** console font
- **E** global language
- **A** time zone
- **J** default editor

## 3. Partitions

Choose **P** (Partition discs) and pick the disk. You can then use:

- **express_mkpart**: creates a basic partition table and chooses the target filesystems for you
- **cfdisk**, **fdisk** or **parted**: partition by hand

`express_mkpart` erases the disk you pick. On a blank disk it creates a GPT partition table. The
layout depends on whether the computer booted the ISO in BIOS or UEFI mode (the installer detects
this):

- **BIOS:** a 1 MB BIOS boot partition (needed by GRUB on GPT), about 512 MB `/boot` (ext4), the rest
  `/` (ext4), and a few GB of swap
- **UEFI:** about 512 MB `/boot` (vfat, partition type "EFI System"), the rest `/` (ext4), and a few
  GB of swap. There is no BIOS boot partition

If you partition by hand, use **M** (Select target partitions) to say where each partition is mounted
and which filesystem it gets. **W** sets up Linux software RAID, and **S** adds a swapfile. For UEFI,
`/boot` must be the EFI system partition: formatted vfat and with the partition type "EFI System"
(in `cfdisk` or `fdisk`). An ext4 `/boot` will not boot.

## 4. Boot Loader

Choose **L** (Select boot loader). The choices depend on the boot mode:

- **BIOS:** **grub2** or **none**. For grub2, pick the disk to install it on (normally the same disk).
- **UEFI:** **systemd** (systemd-boot), **grub2** or **none**. Both boot loaders work under UEFI.
  systemd-boot needs no further questions. For grub2 the installer still says "BIOS" and "MBR
  install", but under UEFI it installs the UEFI version of GRUB.

## 5. Install

Choose **T** (Install lunar) and confirm. The installer creates the filesystems and installs the
packages straight from the ISO, so no network connection is needed at this point. It only takes a few
minutes.

## 6. Final Preparations

Before rebooting you can:

- **R** set the root password (strongly recommended)
- **O** configure compiler optimisations. Lunar builds software from source, and by default it runs
  one compile job at a time. Under **GNU_MAKE**, enter the number of CPU cores (for example `4`) so
  that builds use all of them; the first `lunar update` is much quicker
- **U** set up user accounts
- **H** set up the host name and networking (DHCP or a manual address)
- **V** choose which services start at boot (`lservices` does the same after rebooting)

All except the root password can also be done later. Choose **Z** (Finished installing!) and answer
**Yes** to "Reboot now?". If you are back at a `login:` prompt instead, log in as root and type
`reboot`. Remove the installation media so it boots from the disk.

## After Installation

Log in as root (or the user you created), then bring the system up to date:

```bash
lunar update
```

This fetches the latest moonbase (the module list) and rebuilds anything newer than what's
installed. It compiles from source, so it can take a while, especially when there's a new kernel.
If you skipped **O** during installation, run `lunar optimize` and set **GNU_MAKE** to the number of
CPU cores first, or every build runs one job at a time.
After that, install software with `lin`.

## Troubleshooting

### Boot Issues

If the system won't boot from the disk:
- Check the firmware's boot order, and that the installation media is removed
- Check that the boot loader was installed to the disk you boot from
- On a UEFI computer, check that the firmware boots in UEFI mode (not "legacy" or "CSM"), and that
  `/boot` is the vfat EFI system partition

### Network Issues

If there's no network after rebooting:
- Run `lnet` to check or change the network settings
- Test with `curl -sI https://github.com` (some virtual machines don't pass `ping`)

## Next Steps

- Learn about [package management](/docs/package-management/lin-basics)
- Explore [system administration](/docs/system-administration)
