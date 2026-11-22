---
title: "Module Submission"
description: "How to update a module and submit new or updated modules to the official Lunar Linux moonbase"
category: "development"
tags: ["modules", "submission", "contributing", "moonbase"]
lastUpdated: 2026-11-22
order: 3
---

The moonbase is maintained by the Lunar developers, but anyone can contribute to it. When a module is missing, out of date or broken, you can report it, or fix it yourself and send the fix as a pull request on GitHub.

## Report It or Fix It

To report a problem:

- open an issue on the module's moonbase repository on [GitHub](https://github.com/lunar-linux) (see [Find the Repository](#_1-find-the-repository))
- ask in [#lunar](https://web.libera.chat/#lunar) on [Libera.Chat](https://libera.chat/)
- write to the [Lunar mailing lists](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo)

To fix it yourself, update the module as described below, or write a new one with [Writing Modules](/docs/development/module-writing). Then share it: other people probably want the same module, and may improve it further.

## What Gets Accepted

Pull requests are usually accepted when they:

- add a new or missing module
- update a module to a new version
- fix download or website URLs
- add dependencies the module needs
- add BUILD options that make a failing module build

They are likely to be rejected when they:

- fail `llint`, or don't download or build
- make system-specific changes that not every user wants
- remove explicit dependencies in favour of ones that happen to be installed
- update one part of a larger suite that has to be updated and tested together (X, KDE, GNOME)
- replace a recent stable version with an svn or git development version
- change a core module, or one known to cause update problems for other modules, without discussing it first

## Updating an Existing Module

As an example, this is how gzip went from version 1.13 to 1.14.

### 1. Copy the Module to zlocal

Your copy goes in the `zlocal` section, where a moonbase update won't overwrite it. Lunar only uses zlocal when zlocal overrides are on, so turn them on once:

```bash
lunar set ZLOCAL_OVERRIDES on
```

Then copy the module and change into its directory:

```bash
lvu edit gzip
lvu cd gzip
```

From now on `lin gzip` builds your copy. When you're done, `lvu unedit gzip` deletes it and Lunar uses the moonbase's again.

### 2. Change DETAILS

Set the new `VERSION` and today's date in `UPDATED`. Leave `ENTERED` alone. The checksum comes in the next step:

```diff
           MODULE=gzip
-         VERSION=1.13
+         VERSION=1.14
           SOURCE=$MODULE-$VERSION.tar.xz
    SOURCE_URL[0]=$GNU_URL/$MODULE
    SOURCE_URL[1]=http://www.funet.fi/pub/gnu/alpha/gnu/$MODULE
-      SOURCE_VFY=sha256:7454eb6935db17c6655576c2e1b0fabefd38b4d0936e0f87f48cd062ce91a057
+      SOURCE_VFY=sha256:01a7b881bd220bfdf615f97b8718f80bdfd3f6add385b993dcf6efd14e8c0ac6
         WEB_SITE=https://www.gzip.org
          ENTERED=20010922
-         UPDATED=20230820
+         UPDATED=20250902
            SHORT="Compression utility designed to replace compress"
 
```

If the file name or URL contains the version written out, or the project changed how it names its releases (`v1.14` instead of `1.14`), fix that too.

When you're only fixing a broken URL, without a new version, leave `UPDATED` as it was, so nobody rebuilds for nothing.

### 3. Check the Source and Update the Checksum

Download the new version and check that it is the one upstream released. GNU signs its releases, so gzip's signature can be checked against the GNU keyring:

```bash
lget gzip
cd /var/spool/lunar
wget https://ftp.gnu.org/gnu/gzip/gzip-1.14.tar.xz.sig https://ftp.gnu.org/gnu/gnu-keyring.gpg
gpg --no-default-keyring --keyring ./gnu-keyring.gpg --verify gzip-1.14.tar.xz.sig gzip-1.14.tar.xz
```

Only when it says "Good signature" do you compute the checksum and put it in `SOURCE_VFY`:

```bash
sha256sum /var/spool/lunar/gzip-1.14.tar.xz
```

The checksum you write down is what every user's download is checked against, so it must come from a file you have checked. Not every project signs its releases: [Check the Source](/docs/development/module-writing#_3-check-the-source-and-get-the-checksum) lists the other ways to check.

A checksum that stops matching without a new release is a warning, not a typo to fix. Find out why the file changed before you replace the checksum: some sites regenerate their archive downloads, but the file may also have been tampered with.

### 4. Check What Changed Upstream

Read the release notes (often a `NEWS` file in the source) and compare the build files with the old version's:

- new or removed dependencies: update DEPENDS
- new or renamed build options: update the options in DEPENDS or BUILD
- patches in `patch.d` that upstream has merged: delete them; ones that no longer apply: update them
- `sedit` lines in PRE_BUILD: check the text they change is still there, because `sedit` doesn't complain when nothing matches

### 5. Test It

```bash
llint gzip
lin gzip
```

Then check the result as in [Build and Test It](/docs/development/module-writing#_8-build-and-test-it): the installed files, `lvu links`, and that `lrm` removes it cleanly.

`lvu diff gzip` shows everything you changed compared with the moonbase's copy.

## Submitting a Pull Request

The moonbase is split across several repositories in the [lunar-linux organisation](https://github.com/lunar-linux) on GitHub: `moonbase-core`, `moonbase-other`, `moonbase-xorg`, `moonbase-kde`, `moonbase-gnome`, `moonbase-gnome3`, `moonbase-xfce` and `moonbase-efl`. Each module lives in exactly one of them.

### 1. Find the Repository

Look the module up in the [module browser](/modules): its page shows the repository and folder, for example `moonbase-core/archive/gzip`. The first line of `lvu diff gzip` also names the section (`a/archive/gzip`).

A new module goes in the repository and section where similar modules live. `moonbase-core` holds the base system, so most new modules belong in `moonbase-other`. Ask in #lunar if you're not sure.

### 2. Fork, Branch and Copy Your Changes In

Fork the repository on GitHub, clone your fork and create a branch. Copy the module's files from your zlocal copy into the matching folder of your clone, and review them with `git diff`.

### 3. Commit

Make one commit per module, with a first line of the form `module: what changed`. For a version bump, the moonbase's usual wording is "version bumped to":

```text
gzip: version bumped to 1.14
```

```text
brightnessctl: new module for screen brightness control
```

If there is more to say, such as why a dependency changed, leave a blank line and explain it below. Messages like `update`, `fix` or `please merge` don't tell anyone what changed.

### 4. Open the Pull Request

Push the branch to your fork and open a pull request against the Lunar repository. Keep each pull request to one module, or to a set of modules that have to change together.

### 5. Checks and Review

In `moonbase-core`, `moonbase-other` and `moonbase-xorg`, every pull request is checked automatically:

- **lint** runs `llint` on the modules you changed and posts any errors as a comment
- **Jenkins** builds each module you changed in a fresh Lunar container

The other repositories have no automatic checks yet, so test your module carefully before sending it there.

Fix whatever the checks report by pushing more commits to the same branch. A developer then reviews the pull request, tests it where possible, and merges it or asks for changes. The team is small and works in its spare time, and some modules need particular hardware to test, so a review can take a while.

## Getting Help

Ask in [#lunar](https://web.libera.chat/#lunar) on Libera.Chat or on the [mailing lists](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo). When you're unsure how to do something in a module, find a module that builds the same way and see how it does it.

## Related Topics

- [Writing Modules](/docs/development/module-writing) - Creating a new module, step by step
- [Module Basics](/docs/development/module-basics) - Every module file and option
- [Moonbase](/docs/package-management/moonbase) - How the moonbase is organised
