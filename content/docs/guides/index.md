---
title: "Guides and How-Tos"
description: "Collection of guides and tutorials for Lunar Linux"
category: "guides"
order: 1
---

This section contains practical guides and tutorials for specific tasks in Lunar Linux. Whether you're installing Lunar in a special configuration, working with specific hardware, or learning about build times, these guides provide detailed step-by-step instructions.

## Installation Guides

### Advanced Installation Methods

Learn alternative installation techniques when standard methods won't work:

- [Installing Without a CD Drive](/docs/installation/advanced/no-cd-installation) - Boot from USB or hard disk partition
- [Installing Without Network Access](/docs/installation/advanced/no-network-installation) - Offline installation strategies
- [Software RAID Installation](/docs/installation/advanced/software-raid) - Install Lunar on RAID arrays
- [Kernel Command Line Parameters](/docs/installation/advanced/kernel-parameters) - Configure device management via bootloader

### System Configuration

- [XOrg 7 Setup Guide](/docs/installation/xorg-setup) - Installing and configuring the X Window System
- [Desktop Environments](/docs/installation/desktop-environments) - Choose and install desktop environments

## Understanding Lunar

### Build and Compilation

- [Understanding Build Times](/docs/guides/build-times) - Estimate compilation times and optimize your workflow

### Package Management

- [Package Management Basics](/docs/package-management/lin-basics) - Learn the lin command
- [Moonbase Overview](/docs/package-management/moonbase) - Understanding Lunar's package repository

## Development Guides

### Module Development

- [Module Basics](/docs/development/module-basics) - Introduction to Lunar modules
- [Module Writing Guide](/docs/development/module-writing) - Create your own modules
- [Module Function Reference](/docs/development/module-functions) - Available functions for module files
- [Module Submission](/docs/development/module-submission) - Contributing modules to Lunar

## Community Contributions

### User Experiences

- [User Reports](/docs/community/user-reports) - Real-world installation experiences and hardware compatibility

## Tips and Best Practices

### General Recommendations

- **Start Simple:** Begin with standard installation before attempting advanced configurations
- **Read the Docs:** Most issues have been solved before - check existing documentation
- **Use the Community:** Join `#lunar` on IRC for real-time help
- **Backup First:** Always maintain current backups before system changes
- **Test in VM:** Try complex procedures in a virtual machine first

### Common Workflows

#### Fresh Installation
1. Download and verify ISO
2. Boot from CD/USB
3. Follow the installer wizard
4. Install kernel and bootloader
5. First boot and system update
6. Install desktop environment

#### System Maintenance
1. Update moonbase: `lin moonbase`
2. Check for updates: `lunar update`
3. Apply updates: `lunar update` (confirm)
4. Rebuild kernel if needed
5. Reboot if kernel or critical libraries updated

#### Adding New Software
1. Search for package: `lvu search package-name`
2. Check dependencies: `lvu depends package-name`
3. Install: `lin package-name`
4. Configure if needed

## External Resources

### Official Resources

- [Lunar Linux Website](http://lunar-linux.org/)
- [Mailing Lists](http://lists.lunar-linux.org/cgi-bin/mailman/listinfo)
- [IRC Channel: #lunar on Libera.Chat](https://web.libera.chat/#lunar)

### Third-Party Guides

Many community members have written additional guides and tutorials. Check the Lunar forums and wiki for more specialized content.

## Contributing Guides

We welcome contributions! If you have successfully completed a complex task or solved an unusual problem, please consider documenting your process:

1. Write your guide clearly with step-by-step instructions
2. Include hardware/software specifications
3. Document any issues encountered and solutions
4. Test your instructions on a fresh system if possible
5. Submit via GitHub pull request or contact the Lunar team

Good guides typically include:

- **Overview:** What problem does this solve?
- **Prerequisites:** What's needed before starting?
- **Step-by-step instructions:** Clear, numbered steps
- **Troubleshooting:** Common issues and solutions
- **See Also:** Related documentation links

## Documentation Status

Some guides reference older Lunar versions or deprecated features. When you encounter such content:

- Check if a newer guide exists
- Verify commands work on current Lunar
- Ask in IRC if unsure about outdated information
- Consider helping update the documentation

## See Also

- [Complete Installation Guide](/docs/installation/complete-install-guide)
- [FAQ](/docs/faq)
- [Contributing to Lunar](/docs/contributing)
