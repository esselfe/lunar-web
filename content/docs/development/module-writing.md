---
title: "Writing Modules"
description: "A walkthrough of creating a new module for the Lunar Linux moonbase, from DETAILS to a tested build"
category: "development"
tags: ["modules", "development", "writing", "creating", "llint"]
lastUpdated: 2026-11-22
order: 2
---

Writing a module is writing down the steps you would take to install a piece of software by hand: where to download it, what it needs, and how to build it. Lunar has a default for most of those steps, so a module for well-behaved software is often just two short files.

This page walks through one module from start to finish, Lunar's `pamixer` module, a small command-line volume mixer built with meson. [Module Basics](/docs/development/module-basics) is the reference for every file and option; this page links to it rather than repeating it.

## Before You Start

### Check the Module Doesn't Exist

```bash
# Search module names
lvu apropos pamixer

# Search the module descriptions
lvu search "volume mixer"
```

If it exists but is out of date or broken, fix it instead of writing a new one: see [Module Submission](/docs/development/module-submission) for `lvu edit`.

### Is a Module Worth It?

Look at what the software needs. If its dependencies aren't in the moonbase either, you are signing up for writing those modules too. Some software is easier to install in your home directory, or ships as a single binary that needs no build at all.

## 1. Create the Module

Your own modules go in the `zlocal` section of the moonbase, `/var/lib/lunar/moonbase/zlocal/`, where a moonbase update won't touch them.

Lunar only looks in zlocal when zlocal overrides are on. Without them, `lin` and `lvu` can't find a module that exists only in zlocal. Turn them on once:

```bash
lunar set ZLOCAL_OVERRIDES on
```

With overrides on, a module in zlocal also takes the place of a moonbase module with the same name. That is how you change an existing module: `lvu edit` copies it into zlocal (see [Updating an Existing Module](/docs/development/module-submission#updating-an-existing-module)).

The quickest start is `lvu new`:

```bash
lvu new pamixer
```

(pamixer is already in the moonbase, so on your machine `lvu new` refuses that name and points you to `lvu edit`. Use the name of the software you are packaging.)

It asks for the download URL, a one-line summary, the website and a longer description. Then it downloads the source into `/var/spool/lunar`, guesses `VERSION` from the file name and writes `zlocal/pamixer/DETAILS`. Treat the result as a draft:

- It writes a `sha1:` checksum. Replace it with sha256 (see step 3).
- It leaves no blank line before `cat << EOF`. `llint --fix` adds it (see step 4).
- For downloads where the file name isn't the module's name, such as GitHub's `archive/1.6.tar.gz`, it names the file just `1.6.tar.gz`. Switch to `SOURCE_URL_FULL` (see step 2).

You can just as well create the directory and the file yourself:

```bash
mkdir /var/lib/lunar/moonbase/zlocal/pamixer
cd /var/lib/lunar/moonbase/zlocal/pamixer
```

`lvu cd pamixer` takes you to a module's directory from anywhere.

## 2. Write DETAILS

DETAILS says what the software is and where to download it. This is pamixer's:

```bash
# /var/lib/lunar/moonbase/audio/pamixer/DETAILS
          MODULE=pamixer
         VERSION=1.6
          SOURCE=$MODULE-$VERSION.tar.gz
 SOURCE_URL_FULL=https://github.com/cdemoulins/pamixer/archive/$VERSION.tar.gz
      SOURCE_VFY=sha256:8b7199e495dc19b190f8f02ace8782f533266a4bd7c7d3cf6f4cf09b2de13e71
        WEB_SITE=https://github.com/cdemoulins/pamixer/
            TYPE=meson
         ENTERED=20190403
         UPDATED=20220613
           SHORT="Pulseaudio command-line mixer like amixer"

cat << EOF
pamixer is like amixer but for pulseaudio.
It can control the volume levels of the sinks.
Also, this project can provide you a small C++ library to control pulseaudio.
Features:
 - Get the current volume of the default sink, the default source or a selected
   one by his id
 - Set the volume for the default sink, the default source or any other device
 - List the sinks
 - List the sources
 - Increase / Decrease the volume for a device (using gamma correction
   optionally)
 - Mute or unmute a device.
EOF
```

What to notice:

- **The download.** GitHub serves the release as `archive/1.6.tar.gz`, so the module gives the whole URL in `SOURCE_URL_FULL` and saves it under the name in `SOURCE`. For an ordinary download directory, use `SOURCE_URL` instead and Lunar adds `$SOURCE` to it. See [Source URLs](/docs/development/module-basics#source-urls) and the [mirror variables](/docs/development/module-basics#mirror-variables) such as `$GNU_URL`.
- **`$MODULE` and `$VERSION`** are used instead of writing them out, so the next version bump only changes `VERSION`, `SOURCE_VFY` and `UPDATED`.
- **`TYPE=meson`** picks Lunar's meson build, so the module needs no BUILD file. Leave `TYPE` out for software built with `./configure`. Step 5 has the details.
- **`ENTERED` and `UPDATED`** are both today's date (`yyyymmdd`) in a new module.
- **No `SOURCE_DIRECTORY`**, because the tarball unpacks into `pamixer-1.6/`, the default `$MODULE-$VERSION`. Check with `tar tf /var/spool/lunar/pamixer-1.6.tar.gz | head -1`; if it unpacks anywhere else, set [`SOURCE_DIRECTORY`](/docs/development/module-basics#optional-details-fields).

Every field is described under [The DETAILS File](/docs/development/module-basics#the-details-file). DETAILS is bash, sourced by Lunar, so quote anything with spaces and use `cat << 'EOF'` if the description contains `` ` `` or `$`.

## 3. Check the Source and Get the Checksum

`SOURCE_VFY` pins the module to one exact file. Everyone who builds the module downloads the source themselves, from the URL in DETAILS or a mirror, and `lin` refuses to build it unless the checksum matches. If the file is later swapped on the server, corrupted on a mirror or changed on the way, the build stops instead of installing something nobody has checked.

That protection is only as good as the file you made the checksum from. If you compute it from a download that was already tampered with, the module pins the tampered file and every user installs it. So before you compute the checksum, make sure the file is the one upstream released. That is your job as the module's author; Lunar can't do it for you.

- **Download from the project's own site or repository, over https.** Take the URL from the project's website, not from a search result or a third-party mirror list.
- **Compare with upstream's checksum** when the project publishes one, on its release page or in a `SHA256SUMS` file.
- **Verify the signature** when the project signs its releases (a `.sig` or `.asc` file next to the tarball), with the project's key from its website or earlier releases: `gpg --verify foo-1.2.tar.xz.sig foo-1.2.tar.xz`.
- **When upstream publishes neither**, at least check that the version is a real release or tag in the upstream repository, and that the tarball's contents match it.

pamixer publishes neither, so the file to trust is GitHub's archive of the `1.6` tag in the project's own repository. Download it with `lget`, then compute the checksum:

```bash
lget pamixer
sha256sum /var/spool/lunar/pamixer-1.6.tar.gz
```

Put it in DETAILS with a `sha256:` prefix:

```bash
      SOURCE_VFY=sha256:8b7199e495dc19b190f8f02ace8782f533266a4bd7c7d3cf6f4cf09b2de13e71
```

Don't leave the prefix out or misspell it: Lunar checks `sha256:`, `sha1:` and `md5:` and quietly skips anything else, so a typo means the file is never checked. See [Checksums](/docs/development/module-basics#checksums).

## 4. Lint It

`llint`, from the `lunar-tools` module, checks a module against the moonbase's rules: the `=` signs in one column, the blank line before `cat << EOF`, the required fields, valid dates, `MODULE` matching the directory name, and DEPENDS containing only dependency calls. Every pull request to the moonbase is checked with it, so run it as you go:

```bash
llint pamixer
```

`llint` looks in zlocal first. Most layout problems it can fix for you:

```bash
llint --fix --verbose pamixer
```

## 5. Look at the Build System

Unpack the source somewhere and look at how it builds. The file at the top tells you which default build to use:

| File in the source          | In DETAILS                                       |
|-----------------------------|--------------------------------------------------|
| `configure`                 | nothing, the default                             |
| `meson.build`               | `TYPE=meson`                                     |
| `CMakeLists.txt`            | `TYPE=cmake`                                     |
| `Makefile.PL` or `Build.PL` | `TYPE=perl`                                      |
| only a `Makefile`           | usually a BUILD file that sets `PREFIX` (step 7) |
| something else              | a BUILD file (step 7)                            |

Source from a git checkout often has a `configure.ac` but no `configure` yet; that needs a short BUILD that runs `./autogen.sh` first. [Default Build Process](/docs/development/module-basics#default-build-process) shows what each default runs.

The build files also list what the software needs. pamixer's `meson.build` has two dependencies:

```text
pulse = dependency('libpulse')
cxxopts = dependency('cxxopts')
```

Its build options, if it has any, are in `meson_options.txt` (`configure --help` for autotools, `option()` in `CMakeLists.txt` for cmake). Those are where optional dependencies come from.

## 6. Write DEPENDS

Each dependency of the build becomes a module in DEPENDS. The name the build asks for isn't always the module's name: `libpulse` comes from the `pulseaudio` module. On a machine where it is installed, `lvu from` finds the module that owns a file:

```bash
lvu from /usr/lib/pkgconfig/libpulse.pc
```

Add the build tools the module needs too, since Lunar has no separate list for them. The toolchain every system has (gcc, make, glibc, bash) is left out. For pamixer that gives:

```bash
depends meson
depends cxxopts
depends pulseaudio
```

When a build option turns a feature on or off, make it an optional dependency, and the user is asked. Lunar's `foot` module, a Wayland terminal, does this for its utmp logging:

```bash
# /var/lib/lunar/moonbase/wayland/foot/DEPENDS (excerpt)
optional_depends libutempter "-Dutmp-backend=libutempter" "-Dutmp-backend=none" \
        "for utmp logging backend"
```

The second and third arguments are added to `$OPTS` when the user says yes or no, and the build passes `$OPTS` to meson (or `./configure`, or cmake). Write them in the build system's own syntax.

DEPENDS can only contain these calls, no `if` or other bash. [The DEPENDS File](/docs/development/module-basics#the-depends-file) covers the defaults, choosing one of several modules, aliases such as `%SSL` and cyclic dependencies.

## 7. Write BUILD, Only If You Need It

pamixer has no BUILD file: `TYPE=meson` does everything. Write one only when the default doesn't work. Most BUILD files add an option and then call the default:

```bash
# /var/lib/lunar/moonbase/net/iputils/BUILD
OPTS+=" -DBUILD_MANS=false \
        -DBUILD_HTML_MANS=false"

default_meson_build
```

Software without a build system is built by hand. Then the rules are:

- Join the commands with `&&`, so the build stops at the first failure.
- Call `prepare_install` right before anything is installed. It removes the old version and starts recording the files the module installs. Anything installed before it isn't recorded, so `lrm` can't remove it.
- Install straight into `/`, not into a `DESTDIR`.

```bash
# WRONG: the build runs after prepare_install has removed the old version
prepare_install &&
make &&
make install

# CORRECT
make &&
prepare_install &&
make install
```

[The BUILD File](/docs/development/module-basics#the-build-file) has more examples. To change the source before it builds, there is PRE_BUILD, and patches go in the module's `patch.d` directory: see [The PRE_BUILD File](/docs/development/module-basics#the-pre_build-file).

## 8. Build and Test It

```bash
lin pamixer
```

`lin` asks the optional dependency questions, builds whatever dependencies are missing, downloads and checks the source, and builds and installs the module. If the build fails, read the log:

```bash
lvu compile pamixer
```

After you change DEPENDS, run `lin -r pamixer` to answer the questions again; without `-r` Lunar keeps the earlier answers.

When it has built, check the result:

```bash
# Every file the module installed: look for anything outside /usr and /etc,
# or anything that shouldn't be there at all
lvu install pamixer

# The modules whose libraries pamixer's programs use: each one should be
# in DEPENDS, or come with the toolchain
lvu links pamixer

# Run the program
pamixer --get-volume

# Removing it should take all of its files with it
lrm pamixer
```

`lvu links` catches the most common mistake: a library that was already installed on your machine, so the build found it, but that DEPENDS doesn't mention. On someone else's machine that build fails, or quietly builds without the feature.

Run `llint pamixer` once more after your last change.

## Common Mistakes

- **Checksum mismatch.** The file in `/var/spool/lunar` isn't the one the checksum was made from. When a download stops matching without a new version, find out why before you change `SOURCE_VFY`: some sites regenerate their archive downloads, but a changed file can also have been tampered with. Check the new file against upstream as in step 3 before you trust it.
- **A dependency your machine happens to have.** See `lvu links` above. Read the build files rather than trusting that it built.
- **Changing `UPDATED` for a cosmetic change.** `UPDATED` tells users to rebuild. Change it for a new version or anything that changes the build, not for tidying the file.
- **Doing too much in POST_INSTALL.** Users and groups belong in `sysusers.d`, services in `systemd.d`, and rebuilding another module after this one in a [CATALYST](/docs/development/module-basics#the-catalyst-file) file. See [Module Directories](/docs/development/module-basics#module-directories).

## Next Steps

When the module builds, installs, works and removes cleanly, and `llint` is happy, send it to the moonbase: [Module Submission](/docs/development/module-submission) explains the repositories, the pull request and the review.

To go further:

- [Module Basics](/docs/development/module-basics): every module file and option, the module directories, CATALYST, and platform variants such as `DETAILS.x86_64`
- [Module Functions](/docs/development/module-functions): the functions available in module files
- [Moonbase](/docs/package-management/moonbase): how the moonbase is organised

The moonbase has thousands of modules: when you are unsure how to do something, find a module that builds the same way and see how it does it. `grep -l 'TYPE=cmake' /var/lib/lunar/moonbase/*/*/DETAILS` lists the cmake modules, for example. For help, ask in #lunar on irc.libera.chat.
