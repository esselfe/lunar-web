---
title: "Module Function Reference"
description: "The Lunar functions and variables available in module files, grouped by the file they are used in"
category: "development"
tags: ["development", "modules", "functions", "variables"]
lastUpdated: 2026-11-22
order: 4
---

Lunar runs module files in bash with its own function library loaded, so DEPENDS, BUILD, POST_INSTALL and the others can call these functions directly. This page lists the ones modules use, grouped by where they are used. [Module Basics](/docs/development/module-basics) explains the files themselves.

All of them are ordinary shell functions that return true or false, so chain them with `&&` like any other command.

## Dependencies

Used in DEPENDS and CONFLICTS, and nowhere else. [The DEPENDS File](/docs/development/module-basics#the-depends-file) describes them in full.

| Function                                              | Does                                                    |
|-------------------------------------------------------|---------------------------------------------------------|
| `depends module`                                      | Always installs `module` before this one                |
| `optional_depends module on off "for ..." [y\|n]`     | Asks the user, and adds `on` or `off` to `$OPTS`        |
| `optional_depends_requires leader followers...`       | Makes the followers take the leader's answer            |
| `optional_depends_one_of "heading" module on off ...` | Lets the user choose one module out of several          |
| `conflicts module`                                    | Removes `module` when this one is installed (CONFLICTS) |

## Preparing the Source

Used in PRE_BUILD.

| Function                     | Does                                                                                                         |
|------------------------------|--------------------------------------------------------------------------------------------------------------|
| `default_pre_build`          | What runs without a PRE_BUILD: creates `$SOURCE_DIRECTORY`, unpacks `$SOURCE` and changes into it            |
| `unpack file`                | Unpacks `$SOURCE_CACHE/file` into the current directory: `unpack $SOURCE2`                                   |
| `mk_source_dir [dir]`        | Creates an empty `dir` (default `$SOURCE_DIRECTORY`), removing an old one first                              |
| `sedit 'expression' file...` | Runs `sed -i` on the files                                                                                   |
| `patch_it file level`        | Applies a patch, compressed or not, with `patch -p<level>`; a bare file name is looked up in `$SOURCE_CACHE` |

`sedit` doesn't report when the expression matches nothing, so check that your edits still apply after a version bump. For patches that ship with the module, the `patch.d` directory is simpler than `patch_it`: see [Module Directories](/docs/development/module-basics#module-directories).

## Building

Used in BUILD. The build commands run in `$SOURCE_DIRECTORY`.

| Function                | Does                                                                              |
|-------------------------|-----------------------------------------------------------------------------------|
| `default_build`         | What runs without a BUILD: picks one of the builds below by `TYPE`                |
| `default_gnu_build`     | `default_config`, then `default_make` (the build when `TYPE` isn't set)           |
| `default_config`        | `./configure` with Lunar's prefix and directories, plus `$OPTS`                   |
| `default_make`          | `make`, then `default_install`                                                    |
| `default_install`       | `prepare_install`, then `make install`                                            |
| `default_meson_build`   | `default_meson_config`, `ninja`, `prepare_install`, `ninja install`               |
| `default_meson_config`  | `meson setup` into `$MODULE-$VERSION/`, with `$OPTS`                              |
| `default_cmake_build`   | `default_cmake_config`, `cmake --build`, `prepare_install`, `cmake --install`     |
| `default_cmake_config`  | `cmake -B $MODULE-$VERSION` (Ninja if installed), with `$OPTS`                    |
| `default_python3_build` | `python3 setup.py build` and `install`, for projects that still ship a `setup.py` |
| `default_perl_build`    | `Makefile.PL` or `Build.PL`                                                       |
| `default_game_build`    | autotools, installing into `/usr/games` and `/usr/share/games`                    |
| `prepare_install`       | Removes the installed version and starts recording installed files                |
| `bad_flags flag...`     | Removes flags from `CFLAGS`, `CXXFLAGS`, `CPPFLAGS` and `LDFLAGS`                 |

The usual BUILD adds options and calls one of the defaults:

```bash
# /var/lib/lunar/moonbase/net/iputils/BUILD
OPTS+=" -DBUILD_MANS=false \
        -DBUILD_HTML_MANS=false"

default_meson_build
```

The `*_config` functions only configure. Call one when you need your own build or install commands after it: the build directory is `$MODULE-$VERSION`, inside the source.

Every BUILD that installs files itself must call `prepare_install` first, right before installing; see [prepare_install](/docs/development/module-basics#prepare_install).

`bad_flags` takes flags to remove (`bad_flags -ffast-math`), or `compiler`, `linker` or `ALL` to drop the compiler flags, the linker flags or both. Use it when software breaks with the user's optimizations.

## Installing Extra Files

Used in BUILD, after `prepare_install`, or in POST_BUILD.

| Function                   | Does                                                                                        |
|----------------------------|---------------------------------------------------------------------------------------------|
| `gather_docs file...`      | Copies files or directories from the source into the module's directory in `/usr/share/doc` |
| `ld_add dir`               | Adds a library directory to the module's file in `/etc/ld.so.conf.d` and runs `ldconfig`    |
| `ld_remove dir`            | Removes it again                                                                            |
| `devoke_installwatch`      | Stops recording installed files                                                             |
| `invoke_installwatch`      | Starts recording again                                                                      |
| `add_priv_group group`     | Creates a system group, if it doesn't exist                                                 |
| `add_priv_user user:group` | Creates a system user and its group, if they don't exist                                    |

Files written while recording is stopped don't belong to the module, so `lrm` leaves them behind. Use that only for files that must survive a removal.

For new modules, create users and groups with a `sysusers.d` file instead of `add_priv_user` and `add_priv_group`: see [Module Directories](/docs/development/module-basics#module-directories).

## Asking and Remembering

Used in CONFIGURE, and read back in BUILD or POST_INSTALL. Answers are saved per module, so the user is asked again only when they reconfigure it (`lin -r`). See [The CONFIGURE File](/docs/development/module-basics#the-configure-file).

| Function                                          | Does                                                                           |
|---------------------------------------------------|--------------------------------------------------------------------------------|
| `mquery VAR "question" y\|n [yes_opts] [no_opts]` | Asks once, saves `y` or `n` as `VAR`, and adds the matching options to `$OPTS` |
| `query "question" y\|n`                           | Asks a yes/no question every time and returns true for yes                     |
| `get_module_config VAR`                           | Prints the saved value of `VAR`                                                |
| `set_module_config VAR value`                     | Saves a value                                                                  |
| `unset_module_config VAR`                         | Forgets it, so `mquery` asks again                                             |

When nobody answers within `PROMPT_DELAY` seconds, `query` and `mquery` take the default.

## Checking the System

Usable in any bash module file except DEPENDS.

| Function                               | Does                                                                                      |
|----------------------------------------|-------------------------------------------------------------------------------------------|
| `module_installed module`              | True if `module` is installed (or held)                                                   |
| `in_depends $MODULE dependency`        | True if the user chose `dependency` for this module (or it is a required one)             |
| `installed_version module`             | Prints the installed version                                                              |
| `module_version module`                | Prints the version in the moonbase                                                        |
| `kernel_option_present OPTION [value]` | True if the running kernel's configuration has `OPTION` set to `y` or `m` (or to `value`) |

Use `in_depends` rather than `module_installed` to test an optional dependency: a module can be installed without the user having chosen it for this one. wget's BUILD picks its TLS library that way:

```bash
# /var/lib/lunar/moonbase/ftp/wget/BUILD (excerpt)
if in_depends $MODULE openssl || in_depends $MODULE libressl; then
```

`kernel_option_present` returns 255 when it can't find a kernel configuration, so test for that before treating a false result as "not set".

## Messages

| Function              | Does                                        |
|-----------------------|---------------------------------------------|
| `message text...`     | Prints text, unless Lunar runs silently     |
| `verbose_msg text...` | Prints text only in verbose mode (`lin -v`) |

`message` understands the escape sequences of `echo -e`, and the color variables Lunar uses, such as `${MESSAGE_COLOR}` and `${DEFAULT_COLOR}`.

## Variables

Set by Lunar while it runs a module's files:

| Variable                 | Holds                                                                             |
|--------------------------|-----------------------------------------------------------------------------------|
| `MODULE`, `VERSION`      | The module's name and version, from DETAILS                                       |
| `SOURCE`, `SOURCE2`, ... | The source file names, from DETAILS                                               |
| `SOURCE_DIRECTORY`       | Where the source is unpacked; by default `$MODULE-$VERSION` in `$BUILD_DIRECTORY` |
| `BUILD_DIRECTORY`        | The parent of all source directories, `/usr/src`                                  |
| `SOURCE_CACHE`           | Where downloads are kept, `/var/spool/lunar`                                      |
| `SCRIPT_DIRECTORY`       | The module's own directory in the moonbase, for files shipped with the module     |
| `MODULE_PREFIX`          | The install prefix, `/usr` unless DETAILS sets it                                 |
| `OPTS`                   | Build options collected from DEPENDS, CONFIGURE and `lin --opts`                  |
| `PLATFORM`               | The machine type, as in `DETAILS.x86_64`                                          |

During a [CATALYST](/docs/development/module-basics#the-catalyst-file) trigger, `CATALYST_MODULE` and `CATALYST_MODULE_VERSION` hold the name and version of the module that set it off.

Add to `OPTS` with `OPTS+=" --option"`, so the options from DEPENDS and CONFIGURE are kept.

Since the module files are bash, a BUILD can also define its own shell functions when it repeats itself.

## Reading the Source

The functions live in `/var/lib/lunar/functions` and `/var/lib/lunar/plugins` on an installed system, and in `libs/` and `plugins/` of the [lunar repository](https://github.com/lunar-linux/lunar). Most of them start with a comment that gives their usage. Other functions you find there are Lunar's own internals and can change, so modules shouldn't rely on them.

## See Also

- [Module Basics](/docs/development/module-basics) - Every module file and option
- [Writing Modules](/docs/development/module-writing) - Creating a new module, step by step
- [Module Submission](/docs/development/module-submission) - Updating modules and sending them to the moonbase
