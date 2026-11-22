---
title: "Module Basics"
description: "Understanding the structure and scripts that make up a Lunar Linux module"
category: "development"
tags: ["modules", "development", "BUILD", "DETAILS", "DEPENDS", "CATALYST"]
lastUpdated: 2026-11-22
order: 1
---

In Lunar parlance, software packages are called **modules**. The collection of all modules is the **moonbase**, which is simply a directory (usually `/var/lib/lunar/moonbase/`) containing sections (i.e. directories) which in turn contain the module directories. Your own modules, and your changes to existing ones, go in the `zlocal` section so a moonbase update doesn't overwrite them.

A module is simply a directory containing the files Lunar needs to build a software package, and optionally patches and configuration files.

## Module Files Overview

Only DETAILS is required. For everything else Lunar has a default, so a module needs a file only where the default doesn't fit. Many modules have just DETAILS and DEPENDS, plus a short BUILD that adds a few options.

### Core Module Files

- **DETAILS** - Sets version, source URL(s) and other critical data
- **DEPENDS** - Specifies required and optional modules
- **CONFLICTS** - Specifies modules which must (will) be removed by module
- **CATALYST** - Reacts when other modules are installed or removed (rebuild, remove, toggle an optional dependency, run a script)
- **CONFIGURE** - Interactive script where build options can be set
- **PRE_BUILD** - Prepares the source: unpacking, extra sources, edits
- **BUILD** - Runs necessary variations on: configure; make; make install
- **POST_BUILD** - Rarely needed; runs after BUILD while files are still tracked
- **POST_INSTALL** - Messages, notes, more cleanups, configuration fixes
- **PRE_REMOVE** - Used by `lrm`; actions which must precede removal
- **POST_REMOVE** - Used by `lrm`; actions which must follow removal

Except for CATALYST, these files are bash: Lunar sources them. Any of them can have a platform variant, such as `DETAILS.x86_64`, which is used instead of the plain file on that platform.

A module can also ship directories that Lunar installs by itself, such as `patch.d` and `systemd.d`. See [Module Directories](#module-directories).

### The Order of a Build

When you run `lin`, a module's files are used in this order:

1. **DETAILS** is read
2. **CONFIGURE** asks its questions
3. **DEPENDS** is resolved and missing dependencies are built first
4. The sources are downloaded and their checksums verified
5. **PRE_BUILD** (or the default) unpacks the source
6. **BUILD** (or the default) compiles and installs it
7. **POST_BUILD**, if present, runs, and Lunar finishes recording the installed files
8. **POST_INSTALL** runs
9. **CATALYST** triggers in other modules fire

## Package Build and Install Scripts

The following scripts are used by `lin` or indirectly by `lunar` when building modules.

### The DETAILS Script

Every module is required to have at least a DETAILS file. A minimal DETAILS may appear as follows:

```bash
# /var/lib/lunar/moonbase/archive/gzip/DETAILS
          MODULE=gzip
         VERSION=1.14
          SOURCE=$MODULE-$VERSION.tar.xz
   SOURCE_URL[0]=$GNU_URL/$MODULE
   SOURCE_URL[1]=http://www.funet.fi/pub/gnu/alpha/gnu/$MODULE
      SOURCE_VFY=sha256:01a7b881bd220bfdf615f97b8718f80bdfd3f6add385b993dcf6efd14e8c0ac6
        WEB_SITE=https://www.gzip.org
         ENTERED=20010922
         UPDATED=20250902
           SHORT="Compression utility designed to replace compress"

cat << EOF
gzip - Compresses and decompresses files
A compression utility designed to replace compress. Much better
compression and freedom from patented algorithms are its main advantages
over compress. Gzip decompresses files created by gzip, compress, or
pack; it detects the input format automatically.
EOF
```

`MODULE`, `VERSION`, `SOURCE`, `WEB_SITE`, `ENTERED`, `UPDATED` and `SHORT` are required. `MODULE` must match the module's directory name. Dates are written `yyyymmdd`.

Line the `=` signs up in one column, leave one blank line before `cat << EOF`, and keep lines within 80 columns. `llint`, Lunar's module linter (in the `lunar-tools` module), checks all of this and can fix the layout for you.

Use `$MODULE` and `$VERSION` instead of writing the name and version out, so a version bump only has to change `VERSION`, `SOURCE_VFY` and `UPDATED`.

#### Source URLs

`SOURCE_URL` is the directory the source is downloaded from; Lunar adds `$SOURCE` to it. List more than one as an array, and Lunar tries them in order:

```bash
SOURCE_URL[0]=$GNU_URL/$MODULE
SOURCE_URL[1]=https://ftp.gnu.org/gnu/$MODULE
```

When the file name in the URL isn't the name you want to save it as, as with GitHub's `archive/v1.2.3.tar.gz` downloads, give the whole URL in `SOURCE_URL_FULL` instead, and set `SOURCE` to the name to save it under:

```bash
# /var/lib/lunar/moonbase/libs/xxhash/DETAILS (excerpt)
          SOURCE=xxHash-$VERSION.tar.gz
 SOURCE_URL_FULL=https://github.com/Cyan4973/xxHash/archive/v$VERSION.tar.gz
SOURCE_DIRECTORY=$BUILD_DIRECTORY/xxHash-$VERSION
```

#### Mirror Variables

For software hosted on the big mirror networks, start the URL with one of these variables instead of a single server:

- `$GNU_URL` - GNU mirrors
- `$GNOME_URL` - GNOME
- `$KDE_URL` - KDE
- `$KERNEL_URL` - kernel.org
- `$SFORGE_URL` - SourceForge mirrors
- `$XORG_URL` - X.Org releases
- `$NVIDIA_URL` - NVIDIA drivers
- `$PATCH_URL` - Lunar's own server, for patches that can't be downloaded from anywhere else

Users can point these at a mirror close to them, which makes downloads faster and keeps them working when one server is down. If every URL fails, Lunar also tries its own source cache at download.lunar-linux.org.

#### Checksums

`SOURCE_VFY` checks that the downloaded file is the one the module was written for, and hasn't been corrupted or changed since:

```bash
SOURCE_VFY=sha256:01a7b881bd220bfdf615f97b8718f80bdfd3f6add385b993dcf6efd14e8c0ac6
```

Use `sha256:` for new modules. Lunar also checks `sha1:` and `md5:`, which older modules still use. Compute the checksum from the file you actually downloaded (`sha256sum file`), never copy it from somewhere else. Leave `SOURCE_VFY` out only for modules that download a snapshot from a git or other repository, where the source changes between downloads.

#### Optional DETAILS Fields

**SOURCE_DIRECTORY** - If the tarball doesn't unpack into the default `$BUILD_DIRECTORY/$MODULE-$VERSION`:
```bash
SOURCE_DIRECTORY=$BUILD_DIRECTORY/xxHash-$VERSION
```

**Extra sources** - Number them, each with its own URL and checksum. Unpack them yourself in [PRE_BUILD](#the-pre_build-script):
```bash
         SOURCE2=$MODULE-manpages-$VERSION.tar.xz
     SOURCE2_URL=https://www.kernel.org/pub/software/scm/git/
     SOURCE2_VFY=sha256:6ea093f15745a9ac85fe1b1d4fe488413d54e68d0fcb10bab62f047f362cf6de
```

**TYPE** - Selects the default build when the software doesn't use `./configure`: `meson`, `cmake`, `python3`, `perl` and others. See [The BUILD Script](#the-build-script).
```bash
            TYPE=meson
```

**PSAFE** - If the software doesn't build with parallel make jobs:
```bash
PSAFE=no
```

**MAINTAINER** - If you want your name in the module and be listed as maintainer:
```bash
      MAINTAINER=you@example.org
```

**MODULE_PREFIX** - Installs somewhere other than `/usr`.

Flags such as `PSAFE`, `KEEP_SOURCE` and `USE_WRAPPERS` go on their own lines after the aligned block, without the alignment.

#### When to Update the UPDATED Field

Update the UPDATED field only when you have:
- Added something that will change the compile behavior
- Updated the version
- Added configure options

Don't change it just for formatting tweaks - don't force people to recompile if all you did was tidy up the file. Never change `ENTERED`: it records when the module first appeared.

#### MAINTAINER Field

If you find a MAINTAINER field, please respect this and notify the person listed there that you will or have updated their module.

#### The Description

`SHORT` is a one-line summary, and the text between `cat << EOF` and `EOF` is the long description; both are shown by `lvu what`. They are best taken from the upstream project's own description. Use `cat << 'EOF'` if the text contains `` ` `` or `$`.

### The DEPENDS Script

The DEPENDS script is essential to configuration management and is the key to the overall operation of Lunar. Dependencies should be exactly specified, preferably not assuming the presence of any other modules, while knowing the sub-dependencies of the modules which are added and not adding those explicitly where not needed.

**Warning:** Getting this right is difficult. Because the state of installed packages may vary widely, it's important to have a good understanding of what might or might not be installed on a target system.

**Note:** By convention, modules don't depend on the X server (`xorg-server`), only on the X libraries they use, such as `libX11`. There are two reasons:
1. We expect users to understand that to use a graphical application locally, the X server must be installed
2. Due to X11's unusual definition of client and server, it is often possible to build graphical applications for remote display without the server installed locally

Only modules that plug into the server itself, like the `xf86-video-*` and `xf86-input-*` drivers, depend on it.

DEPENDS can use four functions:

| Function                    | Declares                                                     |
|-----------------------------|--------------------------------------------------------------|
| `depends`                   | A required dependency                                        |
| `optional_depends`          | An optional dependency the user is asked about               |
| `optional_depends_requires` | Followers that go along with an optional dependency's answer |
| `optional_depends_one_of`   | A choice of one module out of several                        |

Write one call per line, without `&&`. Older modules end each line with `&&` to match their BUILD files, but it isn't needed and new DEPENDS files should leave it out.

**Important:** You may not use `if module_installed...` or other general bash programming in the DEPENDS file to handle conditional dependencies. Lunar sources the same DEPENDS file in several contexts (resolving dependencies, building the dependency cache, checking installed modules) with these functions defined differently in each, so it has to contain nothing but calls to them. Use `optional_depends` and its relatives for anything conditional.

#### Required Dependencies

```bash
depends zlib
depends %OSSL
```

`depends` names one module that is always installed before this one.

#### Optional Dependencies

```bash
# /var/lib/lunar/moonbase/devel/git/DEPENDS
depends python
depends %OSSL
depends zlib

optional_depends curl   "--with-curl"    "" "for http(s) transports" y
optional_depends pcre2  "--with-libpcre" "" "for perl regexp support in git-grep" y
optional_depends tk     "--with-tcltk"   "" "for a Tk front-end git tool" n
optional_depends cvsps  ""               "" "for CVS repository import" n
```

`optional_depends` takes up to five arguments:

1. The optional module
2. Options added to `$OPTS` (and so to `./configure`) when the user says yes
3. Options added when the user says no
4. A short explanation shown to the user, starting with "for ..."
5. Optional: the default answer, `y` or `n`

Without the fifth argument the default is `y` when the module is already installed and `n` when it isn't. Give a default when one answer is clearly better whatever is installed: git defaults to `y` for curl because most people want to clone over https.

The answer is saved, so the user is only asked again when they reconfigure the module (`lin -r`). A few cases skip the question:

- The module is already installed and both option strings are empty: it is used without asking.
- The module is enforced (`lunar enforce`): it is always used.
- The module is exiled: it is never used.

#### Follower Dependencies

Some optional dependencies only make sense together. A follower takes the same answer as its leader without asking:

```bash
optional_depends "SDL" "--enable-sdl" "--disable-sdl" "for SDL support"
optional_depends_requires SDL SDL_ttf SDL_image SDL_mixer
```

When the user accepts SDL, SDL_ttf, SDL_image and SDL_mixer are accepted too; when they reject it, all three are rejected. The leader's `optional_depends` must come first. Followers carry no configure options of their own, so put any options the build needs on the leader.

git uses this for its documentation, which needs xmlto as well as asciidoc:

```bash
optional_depends asciidoc "" "" "for git-doc 6 documentation" n
optional_depends_requires asciidoc xmlto
```

#### Choosing One of Several

When several modules provide the same feature and the build can use only one, offer them as a single choice:

```bash
optional_depends_one_of "SSL provider" \
                        openssl  "--with-openssl"  "--without-openssl" \
                        gnutls   "--with-gnutls"   "--without-gnutls" \
                        libressl "--with-libressl" "--without-libressl"
```

The first argument is a heading shown to the user. The rest come in groups of three: module, options if chosen, options if not chosen. Lunar asks about each module in order; once the user accepts one, the remaining ones are rejected without asking. The user can also decline them all. On later runs the existing choice is kept without asking again.

Each question defaults to `y` if that module is installed and `n` if it isn't. To pick a default for unattended installs, mark one module with `@`:

```bash
optional_depends_one_of "SSL provider" \
                        @openssl  "--with-openssl"  "--without-openssl" \
                         gnutls   "--with-gnutls"   "--without-gnutls" \
                         libressl "--with-libressl" "--without-libressl"
```

When nobody answers before `PROMPT_DELAY` runs out, the `@` module is accepted and the others rejected, whatever is installed. Without a marker, an unattended run can end with none of them chosen when none is installed. Only one `@` counts per call; if there are several, the first wins.

#### Aliases

Aliases select a generic module. When you need functionality that two or more modules can provide, depend on the alias and the user picks the provider. Aliases are defined in the `aliases` file at the top of the moonbase (`/var/lib/lunar/moonbase/aliases`):

```bash
%SSL:openssl libressl gnutls
%OSSL:openssl libressl
%XMLRENDERER:libxml2 expat
```

Use an alias anywhere a module name goes:

```bash
depends %OSSL
```

#### Cyclic Dependencies

When two modules depend on each other (A depends on B and B depends on A, through required or optional dependencies), Lunar detects the cycle, accepts the dependency and prints a message saying so. The first module of the cycle is built without the second, then the second is built.

That leaves the first module built without the feature the second provides. To rebuild it once the second is installed, give the first module a [CATALYST file](#the-catalyst-file) that watches the second.

### The CONFLICTS Script

This script is simply used to specify modules which will be removed when a given module is installed.

Example:

```bash
# /var/lib/lunar/moonbase/editors/elvis/CONFLICTS
conflicts vim
```

### The CATALYST File

A CATALYST file makes a module react when another module is installed or removed: rebuild itself, remove itself, switch an optional dependency on or off, or run a script. The module that owns the file is the *reactor*; the module it names is the *watched* module.

Unlike DEPENDS, CATALYST is not a bash script. Lunar reads it as data, one rule per line:

```bash
event watched_module action [param] [immediate]
```

Lines starting with `#` are comments.

#### Events

| Event            | Fires                                  |
|------------------|----------------------------------------|
| `on_install`     | after the watched module is installed  |
| `on_pre_install` | before the watched module is installed |
| `on_remove`      | after the watched module is removed    |
| `on_pre_remove`  | before the watched module is removed   |

#### Actions

| Action    | What it does to the reactor                | `param`                                         |
|-----------|--------------------------------------------|-------------------------------------------------|
| `lin`     | Rebuilds it                                |                                                 |
| `lrm`     | Removes it                                 |                                                 |
| `fix`     | Runs integrity checks and repairs it       |                                                 |
| `enable`  | Turns on one of its optional dependencies  | the dependency (defaults to the watched module) |
| `disable` | Turns off one of its optional dependencies | the dependency (defaults to the watched module) |
| `exec`    | Runs a script from its module directory    | the script's file name (required)               |

`enable` and `disable` only change the saved answer to an `optional_depends` that the reactor's DEPENDS already declares; they don't rebuild anything. Pair them with a `lin` rule.

#### Examples

```bash
# /var/lib/lunar/moonbase/section/mymodule/CATALYST

# Rebuild when openssl is installed, to pick up the new library:
on_install openssl lin

# Use moduleA as soon as it is installed, and stop using it when it is removed:
on_install moduleA enable moduleA
on_install moduleA lin
on_remove  moduleA disable moduleA
on_remove  moduleA lin

# Remove this module when moduleB is removed:
on_remove moduleB lrm

# Run a script from this module's directory after a new kernel:
on_install linux exec rebuild-for-kernel.sh

# Check this module's files after glibc is updated:
on_install glibc fix
```

#### When Triggers Fire

`on_install` and `on_remove` triggers are collected while `lin` or `lrm` works through its list of modules, then fired together at the end. All `enable` and `disable` actions run first, so the rebuilds that follow see the new answers. If the same action for the same module is triggered more than once, it runs once: installing five libraries that mymodule watches rebuilds mymodule once, not five times.

Add `immediate` to a rule when later modules in the same run depend on the result, for example when wget has to be rebuilt against a new openssl before the next module is built:

```bash
on_install openssl lin immediate
```

`on_pre_install` and `on_pre_remove` always fire immediately. `lin --catalyst-immediate` makes every trigger in that run fire straight after its watched module.

A trigger only fires when:

- the reactor module is installed (a CATALYST file has no effect until its module is)
- the watched module is not being removed as part of an upgrade (`lrm -u`, which `lin` uses when it replaces a module); `on_install` still fires when the new version is installed
- for `lin`, the reactor isn't held; held modules are skipped with a notice

Each trigger fires at most once per run, even when the actions start their own `lin` or `lrm`, so two modules that watch each other can't loop. If an action fails, Lunar reports it and writes it to the activity log, but the install or removal that set it off still counts as successful.

#### Exec Scripts

The script given to `exec` must be inside the reactor's module directory; Lunar refuses paths that lead outside it. It is sourced in a subshell with the reactor's DETAILS loaded, `MODULE` set to the reactor and `SCRIPT_DIRECTORY` set to its module directory. Two more variables say what set it off:

- `CATALYST_MODULE`: the watched module
- `CATALYST_MODULE_VERSION`: its version

The same variables are set while a triggered `lin` builds the reactor, so its BUILD can tell why it is being rebuilt.

#### The Trigger Cache

Lunar collects every CATALYST rule in the moonbase into `/var/state/lunar/catalyst.cache`. The cache is rebuilt after a moonbase update and whenever a CATALYST file changes, so a new or edited file takes effect on the next `lin` or `lrm`. Files in `zlocal` are included when `ZLOCAL_OVERRIDES` is on. Rules with an unknown event or action, and `exec` rules without a script, are skipped.

### The CONFIGURE Script

The CONFIGURE script collects input from the user on optional parameters for the build. It runs before DEPENDS, and the answers are saved, so the user is only asked again when they reconfigure the module (`lin -r`).

Most questions are a single `mquery`:

```bash
# /var/lib/lunar/moonbase/system/lilo/CONFIGURE
mquery RUN_LILO "Run LILO automatically upon LILO upgrades?" y
```

```bash
mquery ENABLE_FOO "Enable foo?" n "--enable-foo --enable-foo2" "--disable-foo --disable-foo2"
```

`mquery` takes a variable name, the question and the default answer (`y` or `n`), and optionally options for yes and for no. It saves the answer (`y` or `n`) as the module's setting for that variable and adds the matching options to `$OPTS`. In the second example "no" is the default; if the user says yes, `--enable-foo --enable-foo2` is added to `$OPTS` and so to the build's `./configure`.

To read a saved answer later, in BUILD or POST_INSTALL, use `get_module_config`:

```bash
if [ "$(get_module_config RUN_LILO)" = "y" ]; then
  lilo
fi
```

For anything else, `query "question" y` asks a yes/no question, and `set_module_config VAR value` saves a setting.

### The PRE_BUILD Script

PRE_BUILD prepares the source before the build. Without one, Lunar runs `default_pre_build`, which creates the source directory, unpacks `$SOURCE` and changes into `$SOURCE_DIRECTORY`. A PRE_BUILD replaces that, so it usually starts by calling it:

```bash
# /var/lib/lunar/moonbase/devel/git/PRE_BUILD
default_pre_build &&

unpack $SOURCE2
```

Typical jobs for PRE_BUILD:
- Unpacking extra sources (`unpack $SOURCE2`)
- Small edits to the source, with `sedit 's/old/new/' file`
- Creating directories the build needs

`sedit` is `sed -i`: it doesn't tell you when the pattern no longer matches, so check your edits still apply after a version bump.

Patches don't need PRE_BUILD: put them in the module's `patch.d` directory and Lunar applies them. See [Module Directories](#module-directories).

### The BUILD Script

BUILD is used where the default build doesn't work for a given software package, or needs extra options.

#### Default Build Process

Without a BUILD file Lunar runs `default_build`, which picks a build by the `TYPE` set in DETAILS:

| TYPE      | Build                                                                             |
|-----------|-----------------------------------------------------------------------------------|
| none      | GNU autotools: `./configure`, `make`, `make install`                              |
| `meson`   | `meson setup`, `ninja`, `ninja install`                                           |
| `cmake`   | `cmake` (with Ninja when it is installed), `cmake --build`, `cmake --install`     |
| `python3` | `python3 setup.py build` and `install`, for projects that still ship a `setup.py` |
| `perl`    | `Makefile.PL` or `Build.PL`                                                       |
| `game`    | autotools, installing into `/usr/games` and `/usr/share/games`                    |

The autotools build (`default_gnu_build`) first calls `default_config`, which runs:

```bash
./configure --build=$BUILD                      \
            --prefix=$MODULE_PREFIX             \
            --sysconfdir=/etc                   \
            --localstatedir=/var                \
            --infodir=$MODULE_PREFIX/share/info \
            --mandir=$MODULE_PREFIX/share/man   \
            $OPTS
```

`$MODULE_PREFIX` is `/usr` unless DETAILS sets it. If there is no `configure` script but there is a Makefile, this step is skipped. Then `default_make` runs:

```bash
make ${MAKES:+-j$MAKES} &&
prepare_install &&
make install
```

#### prepare_install

`prepare_install` must be called right before anything is installed. It removes the old version of the module if one is installed, then starts recording every file written, so Lunar knows which files belong to the module and can remove them later. Files installed before it aren't recorded, and a build that installs nothing after it fails with "does not call prepare_install or installs zero files".

Install straight into `/`, not into a `DESTDIR`; Lunar records what gets written.

#### Custom BUILD Examples

Most BUILD files add options and then call a default build:

```bash
# /var/lib/lunar/moonbase/archive/gzip/BUILD
OPTS+=" --bindir=/bin"

default_build
```

```bash
# /var/lib/lunar/moonbase/net/iputils/BUILD
OPTS+=" -DBUILD_MANS=false \
        -DBUILD_HTML_MANS=false"

default_meson_build
```

Calling `default_meson_build` or `default_cmake_build` directly works without setting `TYPE`. When the options depend on what the user chose in DEPENDS, put them in the `optional_depends` call rather than in BUILD.

Software without a configure script or build system is built by hand:

```bash
# /var/lib/lunar/moonbase/libs/xxhash/BUILD
make PREFIX=/usr DISPATCH=1 &&

prepare_install &&

make PREFIX=/usr DISPATCH=1 DESTDIR="" install &&

rm -f /usr/lib/libxxhash.a
```

Source from a git checkout often has no `configure` script yet; run `./autogen.sh` first, then `default_build`.

#### Using && in BUILD Scripts

In the examples above, BUILD scripts contain multiple commands separated by `&&` to ensure that execution stops as soon as any command fails. The `&&` are 'and' operations: the command after the `&&` will only be run if the one before the `&&` completed successfully.

The use of `&&` is **required** in multi-command BUILD scripts.

#### Things to Know

- BUILD runs in `$SOURCE_DIRECTORY`. Files shipped in the module directory are in `$SCRIPT_DIRECTORY`.
- Lunar puts its compiler wrappers first in `PATH` while building. The `make` wrapper adds `-j$MAKES` to every `make` call, so you don't need to. Set `PSAFE=no` in DETAILS for software that breaks with parallel jobs, and `USE_WRAPPERS=off` to turn the wrappers off.
- The build's output goes to the compile log, kept in `/var/log/lunar/compile/`; don't redirect it yourself.
- Use `in_depends $MODULE foo` to test whether the user chose optional dependency foo.

### The POST_BUILD Script

POST_BUILD runs after BUILD, while Lunar is still recording installed files. After it, Lunar runs its own post-build steps: it installs the files from the module's directories (`systemd.d`, `tmpfiles.d`, `config.d` and the others), runs `ldconfig` and finishes the record of installed files.

**Note:** POST_BUILD is rarely needed, and only a handful of modules have one. Install files in BUILD instead (remember not to overwrite existing configuration files), or install defaults from POST_INSTALL (again, not overwriting files that are already there).

### The POST_INSTALL Script

POST_INSTALL runs after the module is installed, to finish setting it up. Its changes aren't recorded as part of the module, so `lrm` won't undo them; this makes it the place for things that should survive a removal or that depend on the machine.

Example:

```bash
# /var/lib/lunar/moonbase/doc-tools/man/POST_INSTALL
if module_installed xserver; then
  if [ ! -e "/etc/man.conf" ] ; then
    cd /etc &&
    ln -sf /usr/share/misc/man.conf man.conf
  fi
fi
```

As in BUILD scripts, the `&&` represent 'and' operations, but their use in POST_INSTALL scripts is preferred rather than required.

Don't use POST_INSTALL to create users or install services; use `sysusers.d` and `systemd.d` (see [Module Directories](#module-directories)). To rebuild another module after this one is installed, put an `on_install` rule in that module's [CATALYST file](#the-catalyst-file) rather than calling `lin` from POST_INSTALL.

## Module Directories

Some directories in a module are installed by Lunar, or by plugins shipped with other modules, without any script:

| Directory      | What happens                                                                                                                                                    |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `patch.d/`     | Patches are applied to the source at the start of the build, in name order (prefix them `01-`, `02-` to set the order). Compressed patches work too.            |
| `systemd.d/`   | Service files are installed into `/usr/lib/systemd/system/`. The user is asked whether to enable each one, and running services are restarted after an upgrade. |
| `sysusers.d/`  | `*.conf` files are installed into `/usr/lib/sysusers.d/` and applied before the build, so the users and groups exist when the software is installed.            |
| `tmpfiles.d/`  | Files are installed into `/usr/lib/tmpfiles.d/` and applied with `systemd-tmpfiles --create`.                                                                   |
| `config.d/`    | Files are installed into `/etc/config.d/`, but only if not already there, so local changes are kept.                                                            |
| `profile.d/`   | `*.rc` files are installed into `/etc/profile.d/` (by the bash module).                                                                                         |
| `skel/`        | Files are copied into `/etc/skel/` (by the bash module).                                                                                                        |
| `pam.d/`       | PAM configuration (by the Linux-PAM module).                                                                                                                    |
| `logrotate.d/` | logrotate configuration (by the logrotate module).                                                                                                              |
| `xinetd.d/`    | xinetd services (by the xinetd module). The `services` file adds port definitions to `/etc/services`.                                                           |
| `plugin.d/`    | Plugins that extend Lunar itself.                                                                                                                               |

Keep module directories small: every moonbase update downloads them. A large patch or extra file belongs on a server, as an extra source (`SOURCE2`) in DETAILS.

## Package Removal Scripts

Module removal is handled by `lrm`. Because Lunar recorded every file the module installed, most of the removal is automatic. PRE_REMOVE and POST_REMOVE handle anything else.

### The PRE_REMOVE Script

PRE_REMOVE runs before the module's files are removed. Use it to stop or undo things that need the module's files to still be there.

Example:

```bash
# /var/lib/lunar/moonbase/net/resolvconf/PRE_REMOVE
resolvconf --wipe-runtime-directories &&
rmdir "`readlink /etc/resolvconf/run`" &&

if [ -L /etc/resolv.conf ] && [ "`readlink /etc/resolv.conf`" = "/etc/resolvconf/run/resolv.conf" ]; then
  rm /etc/resolv.conf
fi &&

if [ -e /etc/resolvconf/resolv.conf.d/original ]; then
  cp /etc/resolvconf/resolv.conf.d/original /etc/resolv.conf
fi
```

Services from `systemd.d` are disabled automatically before removal.

### The POST_REMOVE Script

POST_REMOVE runs after the files are removed. Use it to remove data that wasn't recorded and to adjust remaining configuration files and data.

Example:

```bash
# /var/lib/lunar/moonbase/archive/gzip/POST_REMOVE
install-info --delete gzip --info-dir /usr/share/info
```

PRE_REMOVE and POST_REMOVE don't run when `lin` replaces the module with a new version (the old version is removed with `lrm --upgrade`), so they can safely undo things the new version would need.

## Related Topics

- [Module Writing](/docs/development/module-writing) - Learn how to write modules
- [Module Functions](/docs/development/module-functions) - Reference for available functions
- [Module Submission](/docs/development/module-submission) - How to submit modules to moonbase
