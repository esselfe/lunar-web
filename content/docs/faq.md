---
title: "Frequently Asked Questions"
description: "Short answers to common questions about Lunar Linux: installing, optimizing, adding and removing modules, and the penguin in the logo"
category: "general"
tags: ["faq", "help", "troubleshooting", "guide"]
lastUpdated: 2026-11-26
order: 1
foldQuestions: true
---

The questions that come up most often, answered briefly. If yours isn't here, ask in
[#lunar on Libera.Chat](https://web.libera.chat/#lunar).

## General

### What is Lunar Linux?

A source-based Linux distribution: your machine compiles every program from the original source code,
with the options you choose. The [About](/about) page has the whole picture.

### Is Lunar 64-bit?

Yes. Lunar runs on 64-bit PCs (x86_64), and the current ISOs are built for nothing else. The last
32-bit (i686) release was 1.7.0, which is still on the [download page](/download).

There is no multilib toolchain, so programs that need 32-bit libraries don't run on Lunar.

### Where do I find general Linux help?

The Lunar documentation covers what is specific to Lunar. For everything else, the wider Linux world
has already written it down. Some good places to start:

- [The Arch Wiki](https://wiki.archlinux.org/): detailed and accurate for most programs, whatever the distribution
- [The Linux kernel documentation](https://docs.kernel.org/): configuring and building kernels
- [Kernel Newbies](https://kernelnewbies.org/): what changed in each kernel release

## Installing Lunar

### How should I partition my disk?

Start with the partitions every Lunar system needs. Which ones depends on whether the computer
boots in UEFI or BIOS (legacy) mode:

| Partition | UEFI | BIOS |
| --- | --- | --- |
| `/boot` | **Required:** about 512 MB, vfat, partition type "EFI System" | Optional but recommended: about 512 MB, ext4 |
| BIOS boot | Not used | 1 MB, only on a GPT disk (GRUB needs it there); an MBR disk doesn't |
| swap | A few GB | A few GB |
| `/` | The rest, or see below | The rest, or see below |

On UEFI, `/boot` has to be the EFI system partition: an ext4 `/boot` won't boot. If you want to
hibernate, make swap at least as large as your RAM. The installer's `express_mkpart` creates this
layout for you; the [installation guide](/docs/installation/installation-guide) walks through it.

**Dual-booting with Windows?** Make `/boot`, the EFI system partition, at least 1 GB. Windows keeps
its own boot files there too, and they take up a lot of room next to Lunar's kernels and initramfs
images.

How you split up the rest depends on what the machine is for.

**Desktops** usually have one disk that you partition once and then leave alone. Next to `/boot`
and swap, two partitions are enough:

1. **`/`**: Lunar and all its software. Lunar takes 8 to 32 GB depending on how much you install,
   and the downloaded sources (`/var/spool/lunar`) and install caches (`/var/cache/lunar`) grow over
   time, so leave room. You can manage with less if you clean up often.
2. **`/home`**: the rest of the disk.

**Servers** need room to fail safely:

- Put `/var/log` and `/var/tmp` on their own partitions, so runaway logs can't fill up `/`
- Mount `/tmp` as tmpfs: it stays clean and is fast
- Keep `/home` on its own partition too; it rarely needs to be large

### Should kernel drivers be built in or modules?

There are many schools of thought. A good rule: **if it isn't needed to boot, make it a module.**

USB, input, sound, ACPI, network and every filesystem you don't boot from can all be modules. That
keeps the kernel small, and it is safer: if a driver misbehaves, you can leave its module unloaded and
still have a working system. A built-in driver always loads.

Some setups need things the other way around. Do whatever works for your machine.

### How do I test a Lunar ISO in QEMU?

To check that an ISO boots:

```bash
qemu-system-x86_64 -enable-kvm -m 2048 -cdrom lunar-1.8.0-daily-YYYYMMDD-x86_64.iso -boot d
```

To test a full install, create a 20 GB disk image:

```bash
qemu-img create -f qcow2 lunar.qcow2 20G
```

Boot the installer with the disk attached:

```bash
qemu-system-x86_64 -enable-kvm -m 2048 -smp 2 -vga std \
  -drive file=lunar.qcow2,format=qcow2,if=virtio \
  -cdrom lunar-1.8.0-daily-YYYYMMDD-x86_64.iso -boot d
```

After the install, power off the VM and start the new system from the disk:

```bash
qemu-system-x86_64 -enable-kvm -m 2048 -smp 2 -vga std -nic user \
  -drive file=lunar.qcow2,format=qcow2,if=virtio
```

QEMU is just as handy for checking that a freshly built kernel boots.

When you `lin qemu`, say yes to the SDL2 or GTK 3 optional dependency, so the VM gets its own window.

## Optimizations

### How do I set optimizations?

Run `lunar optimize`. Pick a component (the GNU C Compiler, the GNU linker, the compiler cache) and
you get a menu where every option has a short explanation.

Leave **optimization safety** on (it is on by default). It hides the settings that are known to break
builds.

### What are safe optimizations?

The defaults. They work for almost everyone:

| Menu                         | Setting                                                                            |
|------------------------------|------------------------------------------------------------------------------------|
| Base speed optimization      | **Faster** (`-O2`)                                                                 |
| CPU base arch selection      | **x86-64** to run the system on any 64-bit PC, or **native** for this machine only |
| CPU extensions               | None                                                                               |
| Specialized optimizations    | The defaults: `-fno-plt`, `-fexceptions`                                           |
| Floating point optimizations | None                                                                               |
| General C/C++ options        | The defaults: `-pipe`, fortify, stack clash protection                             |
| GNU linker                   | **Strip** on (turn it off when you need debug symbols for a problem module)        |
| Compiler cache               | ccache on                                                                          |

**native** (`-march=native`) turns on every extension your CPU has (SSE4, AVX and so on), so you don't
need to pick them under CPU extensions. A system built that way may not run on an older or different
CPU.

There is room to push further, at the risk of breaking some modules. Read `info gcc` and make sure you
understand an optimization before you turn it on.

### What optimizations can give some speed without issues?

With safety on, everything under **Specialized optimizations** is taken from what GCC already
does at `-O2`, so it is safe to experiment with. `-fomit-frame-pointer` (Pointers) is a reasonable
first pick.

**Fastest** (`-O3`) needs safety off. It compiles more slowly and doesn't always produce faster code.

### What optimizations cause problems?

These only appear with safety off, and they are known to break many modules:

- `-funroll-loops` (Speedy)
- `-ffast-math` (Risky): breaks the IEEE floating point rules that many programs rely on
- `-ffloat-store` (Float)

Avoid `-fprofile-arcs` (Profiling) and `-fbranch-probabilities` (Branching) altogether. They are two
halves of profile-guided optimization, and a normal `lin` never produces the profile they need.

Before you report a failed build, turn safety back on and try again: reports from builds with risky
optimizations won't be followed up.

## Installing modules

### Can I compile several modules at once?

Yes, and Lunar is built for it, though each build runs slower when they share the CPU. Lunar won't
install core modules like `gcc` or `glibc` while anything else is installing: it waits until the rest
has finished, and other modules wait while one of those is installing. They all continue automatically.

### Download failed: broken URL

There are three likely reasons.

**1. The mirror is busy or incomplete.** Run `lunar` as root, open **Options › Software Mirrors**, and
pick a mirror closer to you.

**2. The file has moved**, or the site is temporarily offline.

- Find the tarball on the module's website (`lvu website MODULE`) or search the web for it
- Download it yourself, copy it to `/var/spool/lunar`, and run `lin` again
- Or run `lvu edit MODULE` to make a `zlocal` copy of the module, and give it the new location or a
  second URL

**3. The version was removed** because a newer one came out.

- Check the module's website for the new version number
- Try `lin -w NEW_VERSION MODULE` first; with luck it builds as is
- Otherwise run `lvu edit MODULE` and update the version, location and sha256sum in the `zlocal` copy

If you make a `zlocal` copy that works, please send it to us as a pull request on GitHub. See
[Module Submission](/docs/development/module-submission).

### configure: error: C compiler cannot create executables

The compiler is missing a library it needs. Look in `/usr/src/MODULE-VERSION/config.log` for the
library that fails to load. Two known cases:

**ccache can't load a library**, for example:

```
ccache: error while loading shared libraries: libfmt.so.10: cannot open shared object file
```

Turn ccache off in `lunar optimize`, rebuild it with `lin -c ccache`, turn it back on, and try the
module that failed again.

**gcc can't load an updated isl**, for example:

```
cc1: error while loading shared libraries: libisl.so.XX: cannot open shared object file: No such file or directory
```

This happens when gcc was built with isl support and isl then got a new library version. Go back to
the previous isl version, rebuild gcc without isl, update isl again, and finally rebuild gcc with isl.

### configure: error: C preprocessor "/lib/cpp" fails sanity check

A header file is missing. Usually it is the kernel headers in `/usr/include`. Reinstall them:

```bash
lin kernel-headers
```

If that doesn't help, you can install them from a kernel source tree yourself:

```bash
cd /usr/src/linux
make headers_install INSTALL_HDR_PATH=/usr
```

Less often, `/usr/include/gnu/stubs.h` is missing. It belongs to glibc, and `lin -c glibc` puts it
back.

### How do I add a window manager to the login screen?

Display managers like GDM, SDDM and LightDM list the sessions they find in `/usr/share/xsessions/`
(X11) and `/usr/share/wayland-sessions/` (Wayland). Most window manager modules install a `.desktop`
file there. If yours doesn't, write one, or copy it from the window manager's source.

## Removing modules

### How do I remove a module?

If you have just installed a module for the first time with `lin`, it is usually safe to remove it
with `lrm`.

If you have since built modules that depend on it, be careful:

- `lvu eert MODULE` shows the tree of modules that depend on it
- Remove those too, or rebuild them with `lin -rc` and choose different optional dependencies
- Run `lunar nofix` afterwards to check that no hidden dependency broke

`lrm -p` removes the module along with everything that depends on it. That is rarely what you want,
and it is an easy way to break your system.

### How do I safely remove an optional dependency?

There are three ways, from safe but slow to quick but risky.

**1. By hand:** follow the steps above, starting from `lvu eert`.

**2. Rebuild everything that depends on it.** `lsh` gives you Lunar's internal functions. Remove the
module first, so the rebuilds and `lunar fix` can't quietly pick it up again, then rebuild its
dependents in dependency order:

```bash
lrm MODULE
DEPENDENTS=$(lsh list_installed_depending MODULE | sort -u)
lin -cr $(lsh sort_by_dependency $DEPENDENTS)
lunar fixdepends
lunar fix
```

**3. Quick and risky:** `lrm MODULE`, then `lunar nofix` to find what broke, and `lin -cr` each module
it reports. Repeat until `lunar nofix` is quiet.

## Lunar core tools

### How do I rebuild a module with new options?

```bash
lin -r MODULE
```

`-r` asks the configuration questions and optional dependencies again.

### How do I make a module compile instead of resurrecting?

```bash
lin -c MODULE
```

`-c` compiles the module even if there is an install cache of it in `/var/cache/lunar`.

### Module X no longer depends on module Y. How do I tell Lunar?

Lunar records a module's dependencies when you install it, so it may keep pulling in Y. You can't
remove a single dependency, but you can rebuild the dependency cache from the modules installed now:

```bash
lsh create_module_index
lsh create_depends_cache
lunar fixdepends
```

Dependencies of modules in `zlocal` are ignored: if X in the main moonbase depends on Y, the cache keeps
that dependency.

### My moonbase is gone and I can't install anything

```bash
lin moonbase
```

This downloads the latest moonbase and puts it back in working order.

### What is a module?

A module is a small set of bash scripts and files that tell the core tools:

- the package's name, version and other properties
- where to download its sources
- which other modules it needs or conflicts with
- how to unpack and patch the sources
- how to configure, compile and install them
- what else to do afterwards

See [Module Basics](/docs/development/module-basics) to read or write one.

### What is the moonbase?

The collection of every module Lunar offers, kept as plain directories and files. It's the Lunar
equivalent of Gentoo's portage or the BSD ports tree. See [Moonbase](/docs/package-management/moonbase),
or look around in the [module browser](/modules).

## Other

### How do I unpack an .rpm file?

Install the `rpmunpack` module and run:

```bash
rpmunpack XYZ.rpm
```

This gives you a cpio archive (sometimes compressed, as `XYZ.cpio.gz` or `XYZ.cpio.bz2`; unpack those
with `gunzip` or `bunzip2` first). Then extract it:

```bash
cpio -i -d < XYZ.cpio
```

A source RPM (`.src.rpm`) usually contains a source tarball as well. `man cpio` lists more options,
such as `-L`.

### What is in the Lunar Linux logo?

A [rockhopper penguin](https://en.wikipedia.org/wiki/Southern_rockhopper_penguin). Lunar started out
as Lunar Penguin (the [history](/history) page tells the story), and the penguin stayed when the name
changed.

Rockhoppers are among the smallest crested penguins, about 50 cm tall, with red eyes and a spiky
crest of yellow feathers that sticks out sideways above each eye. They are named for the way they get
around: instead of waddling or sliding on their bellies, they jump from rock to rock with both feet
together, up steep and wave-battered shores. They breed in large, noisy colonies on islands in the
Southern Ocean, and they are famously bold for their size. A fitting mascot for a distribution you
build yourself, one module at a time.

Michael Schindler designed the first logo in 2003, and it was the official logo from 2004 to 2024. The
current logo was designed by tbeckerson in 2022 and is used almost everywhere now; DistroWatch still
shows the old one.
