---
title: "Module Function Reference"
description: "Reference guide for functions available in Lunar module scripts"
category: "development"
tags: ["development", "modules", "functions", "api"]
order: 4
---

This page provides a comprehensive reference for functions available when writing Lunar Linux modules.

**Status:** This documentation is currently under development. Content is being migrated and expanded.

## Overview

Lunar modules can use a variety of built-in functions provided by the Lunar package management system. These functions handle common tasks like downloading sources, applying patches, installing files, and managing dependencies.

## Common Module Functions

### Source Management

Functions for handling source code downloads and extraction:

- `download_source` - Download source tarballs
- `unpack_source` - Extract downloaded archives
- `verify_source` - Verify checksums and signatures

### Build Functions

Functions used during the build process:

- `default_build` - Standard configure/make/make install sequence
- `default_config` - Run ./configure with common options
- `default_make` - Run make with appropriate flags
- `default_install` - Run make install

### File Management

Functions for file and directory operations:

- `install_file` - Install files to specific locations
- `install_dir` - Create directory structures
- `make_link` - Create symbolic links
- `safe_remove` - Safely remove files

### Dependency Management

Functions for handling module dependencies:

- `depends` - Declare required dependencies
- `optional_depends` - Declare optional dependencies
- `optional_depends_requires` - Make modules follow an optional dependency's answer
- `optional_depends_one_of` - Offer a choice of one module out of several
- `conflicts` - Specify conflicting modules

### Configuration

Functions for module configuration:

- `query` - Ask user questions during installation
- `set_option` - Set module-specific options
- `get_option` - Retrieve module options

## Module Script Structure

A typical Lunar module consists of several scripts:

- `DETAILS` - Module metadata (name, version, sources)
- `DEPENDS` - Dependency declarations
- `CATALYST` - Triggers that react to other modules being installed or removed
- `CONFIGURE` - Configuration questions
- `BUILD` - Build instructions
- `PRE_BUILD` - Pre-build setup
- `POST_INSTALL` - Post-installation tasks

## Writing Custom Functions

Modules can define custom functions for complex build processes. These functions have access to the full Lunar function library.

## Further Documentation

For detailed information on writing modules, see:

- [Module Writing Guide](/docs/development/module-writing)
- [Module Basics](/docs/development/module-basics)
- [Module Submission](/docs/development/module-submission)

## Contributing

This reference is incomplete. Contributions are welcome! If you have experience with Lunar module development, please help expand this documentation.

## Source Code

The actual function implementations can be found in the Lunar source code:

- `/var/lib/lunar/functions` - Core functions
- `/var/lib/lunar/plugins` - Plugin functions

You can examine these files directly for the most up-to-date function definitions and usage examples.

## See Also

- [Module Writing Guide](/docs/development/module-writing)
- [Module Basics](/docs/development/module-basics)
- [Package Management](/docs/package-management/)
