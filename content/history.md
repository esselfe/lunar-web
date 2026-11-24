---
title: History
headline: A quarter century in orbit
description: How a fork of a "magic" Linux distribution became Lunar, and has kept orbiting ever since.
---

Every distribution has an origin story. Ours has sorcerers, a vanishing act, a three-way split and a moon. Here it is, told the way the Moon keeps time: one phase at a time, from one new moon to the next.

::history-chapter{phase="0" when="Around 2000"}
## Before the Moon

Rewind to the turn of the millennium. No GitHub, no continuous integration, no containers. Most Linux users installed prebuilt packages and hoped the defaults suited them.

Then Kyle Sallee's **Sorcerer GNU/Linux** asked a cheeky question: what if your computer built everything itself? Sorcerer fetched software straight from the people who wrote it, compiled it on your own machine, let you choose the optional parts, and kept its package manager small enough to read in an afternoon.

It also had the best vocabulary in Linux. Packages were *spells*, kept in a *grimoire*. You *cast* software to install it, *dispelled* it to remove it and *gazed* to learn about it. The package manager itself was called *sorcery*, naturally.

Lunar still speaks a version of that language, with fewer wizard hats:

| Sorcerer said | Lunar says | What it is                                    |
|---------------|------------|-----------------------------------------------|
| spell         | module     | the recipe for building one piece of software |
| grimoire      | moonbase   | the collection of every recipe                |
| `cast`        | `lin`      | install something                             |
| `dispel`      | `lrm`      | remove it again                               |
| `gaze`        | `lvu`      | look things up                                |
| sorcery       | lunar      | the package manager itself                    |
::

::history-chapter{phase="0.125" when="2001–2002"}
## Liftoff

As Sorcerer grew, so did the arguments about where it was heading and who got to decide. In late 2001 and early 2002, a small group of its developers forked it.

They called the new project **Lunar Penguin**. It wasn't a rebellion for the fun of it: the idea was to keep Sorcerer's technology alive and keep improving it together, in the open. Lunar Penguin was soon renamed **Lunar Linux**, and the Lunar-Penguin name stayed on as an umbrella for any sister projects that might follow.

The first piece of magic to get a new name was the spell-caster itself. On 19 May 2002 Kagan Kongar, Lunar's main developer at the time, rewrote Sorcerer's `cast` as `lin`, and kept the old copyright notices in its header "just in case some code is left :=)". Open `lin` today and that note is still sitting at the top.

The oldest commit that survives in our repositories is dated **21 August 2002**: Chuck Mead's "Initial revision" of the package manager, carried over from the project's original CVS repository. The moonbase's history starts on the very same day.
::

::history-chapter{phase="0.25" when="2002"}
## Half the sky goes dark

Then came the eclipse. Not long after Lunar appeared, Sorcerer vanished from the internet. Its users suddenly couldn't update their systems, and developers scrambled to rebuild the distribution from backups and whatever copies they had lying around.

Kyle Sallee eventually returned and picked Sorcerer back up, but under a new license, the Sorcerer Public License, written to stop anyone from forking it again. Most of the remaining developers rebuilt the earlier GPL version from their backups instead. Out of respect for Kyle's wishes they gave up the Sorcerer name, voted on a new one, and became Source Mage, with a motto worthy of the family: "Linux so advanced, it may as well be magic."

When the dust settled, one distribution had become three:

:::history-lineage
---
root: Sorcerer GNU/Linux
rootWhen: 2000
branches:
  - name: Sorcerer
    note: Kyle Sallee's path, under the SPL
  - name: Source Mage GNU/Linux
    note: rebuilt from the GPL backups
  - name: Lunar Linux
    note: simple, transparent, and still here
    current: true
---
:::
::

::history-chapter{phase="0.375" when="Finding our way"}
## Our own orbit

Source Mage set out to build ever more powerful package management. Lunar went the other way, and has stuck with it ever since:

- **Simple:** most of the system is shell scripts you can open and read.
- **Stable:** things change carefully, never just for the sake of it.
- **Pragmatic:** stay close to upstream and patch only when you have to.
- **Transparent:** modules stay understandable and nothing hides the machinery.
- **Yours:** the system trusts its user.

While other distributions raced toward binary convenience or ever-thicker layers of automation, Lunar kept one promise:

> The user should always be able to understand what the system is doing.

That made Lunar a home for administrators, developers and the plain curious: people who would rather know how their system works than have it work by magic.
::

::history-chapter{phase="0.5" when="2002–2014"}
## The full-moon years

Changes poured into the moonbase and ISOs rolled off the launch pad. Mission control was a single machine called **dbguin**, which carried the CVS repository, the mail and the downloads all at once. When it went dark in November 2003, the #lunar topic sent everyone to mirrors in Denmark, the Netherlands and a university machine in Berlin. In August 2004 Lunar moved to a new server, **espresso**, and shared it with a neighbour: xfce.org. Together they went by foo-projects.org, short for "free Opensource Oriented projects".

There was a new face, too. In December 2003 Lunar got a new logo, which the channel promptly called "menacing and evil". It looked great on the login screen, and it stayed Lunar's face for nearly two decades, until a new logo arrived in 2022: the one at the top of this page.

A few landmarks, dated from the channel topics, the release tags and the git history:

- **July 2003:** Lunar 1.3.1 is the release everyone installs when the oldest surviving #lunar logs begin
- **August 2003:** Lunar 1.3.2, with an xdelta patch so 1.3.1 users could skip most of the download
- **January 2004:** Lunar 1.3.3, with a BitTorrent tracker to share the load
- **February 2004:** the first Lunar Weekly News, stitched together from the developers' announcements
- **March 2004:** Lunar 1.4.0
- **April 2004:** a new website goes live, and an issue tracker follows in June
- **Spring 2005:** the code moves from CVS to Subversion
- **May 2005:** Lunar 1.5.0
- **August 2005:** Lunar 1.5.1
- **April 2006:** Lunar 1.6.0
- **February 2007:** Lunar 1.6.1
- **November 2007:** the code moves from Subversion to Git, before GitHub even existed
- **December 2008:** Lunar 1.6.4
- **August 2010:** Lunar 1.6.5, in the moonbase's busiest year on record
- **September 2010:** systemd lands in the moonbase, six months after systemd's first release. Trying it took one boot option
- **April 2012:** the moonbase splits into sections: core, X.Org, Xfce and EFL first, with KDE and GNOME 3 following by July
- **1 July 2012:** everything moves to [GitHub](https://github.com/lunar-linux)
- **October 2014:** Lunar 1.7.0
::

::history-chapter{phase="0.625" when="2014–2017"}
## Quiet skies?

After 1.7.0 the releases paused, and the public channels went quiet. From the outside it looked as if Lunar had drifted out of orbit.

Every year or two a stranger floated into #lunar to ask whether Lunar was still alive. In August 2016 the question was barely two minutes old when the build bot answered for us: "[FAILED] moonbase-core build #737 – elfutils: version bumped to 0.167." Not the most flattering reply, but definitely a pulse.

That bot had joined the channel in November 2014, the voice of a new Jenkins server that tested every change. Like the servers it ran on, it was kept going year after year, quietly, the way good ground crews do. The bot built the moonbase's changes and reported every result in #lunar: nearly 3,900 of them by May 2021. In August 2017 the ISO started building itself every day, announced in the channel with quiet pride: "Three successful daily isos in a row!" The daily builds have been rolling off the pad ever since. In October 2017 we finally said it out loud: [we are still very much alive](/news/2017-10-18-we-are-still-very-much-alive).

And we were. The releases had paused, but the moonbase never did. Here is every year since that first commit, one moon each. The fuller the moon, the more changes landed in the moonbase that year:

:::moonlight-calendar
---
asOf: 2026-11-21
years:
  - { year: 2002, changes: 1136 }
  - { year: 2003, changes: 3808 }
  - { year: 2004, changes: 4611 }
  - { year: 2005, changes: 4383 }
  - { year: 2006, changes: 4541 }
  - { year: 2007, changes: 4298 }
  - { year: 2008, changes: 3849 }
  - { year: 2009, changes: 5249 }
  - { year: 2010, changes: 5732 }
  - { year: 2011, changes: 5313 }
  - { year: 2012, changes: 3083 }
  - { year: 2013, changes: 3155 }
  - { year: 2014, changes: 3230 }
  - { year: 2015, changes: 3843 }
  - { year: 2016, changes: 3971 }
  - { year: 2017, changes: 3440 }
  - { year: 2018, changes: 5436 }
  - { year: 2019, changes: 3897 }
  - { year: 2020, changes: 4843 }
  - { year: 2021, changes: 3849 }
  - { year: 2022, changes: 3392 }
  - { year: 2023, changes: 3598 }
  - { year: 2024, changes: 4076 }
  - { year: 2025, changes: 4333 }
  - { year: 2026, changes: 4521 }
---
:::

Even the quietest full year, 2012, the year of the big split, saw more than 3,000 changes. Quiet skies, busy moonbase.
::

::history-chapter{phase="0.75" when="2018 to today"}
## Still in orbit

Since then the tools have changed, the way tools do.

In May 2021 freenode, home of #lunar since before our oldest logs, changed hands, and most of its staff walked out to start Libera.Chat. We [followed within days](/news/2021-05-23-we-are-moving-to-libera-chat-network) and left a note in the old channel's topic pointing the way. Five days later freenode's new owners took the channel over: the note itself was "in violation of freenode policy". Some of us still remembered 2006, when the #lunar topic read "RIP Rob, Thanks for everything" for Rob Levin, the founder of freenode.

Continuous integration still checks every contribution, and a linter now reads every module. Since March 2026 there's also moonbeam, the newest member of the crew: ask it on IRC for a version bump (`.module update gmic to 3.7.3`), and an AI agent does the work and opens the pull request, which CI then builds like any other. By November 2026 it had opened more than 1,100 of them. On this site, the [arrivals board](/#moonbase) shows modules landing in the moonbase as it happens.

None of that changed what Lunar is.
::

::history-chapter{phase="0.875" when="Always"}
## What we carry forward

Strip away the tools and Lunar is what it was on the first day:

1. Build locally.
2. Understand your system.
3. Stay close to upstream.
4. Patch only when necessary.
5. Preserve flexibility.
6. Trust the user.

Lunar's story isn't really about a Linux distribution. It's about a community that chose openness over control, kept the ideas worth keeping, and preferred understanding technology to just consuming it. Around 200 people have left their mark in our repositories so far, and they've shown that a small crew held together by shared values and plain curiosity can stay in orbit far longer than anyone expected.
::

::history-chapter{phase="1" when="Now"}
## The next new moon

Every lunar month ends the way it began, with a new moon, and the next cycle is already rising: Lunar 1.8.0 is built every day. [Take the daily build for a spin](/download), say hello in [#lunar on Libera.Chat](https://web.libera.chat/#lunar), or [help write the next chapter](/docs/contributing).

The Moon keeps going. So does Lunar.
::

## Sources

The early history is consistent across several independent accounts: DistroWatch's description of Lunar Linux, LWN's 2005 article "About Source Mage", Source Mage's own history page, and the recollections of people who were there. Many of the stories from 2003 onward come from the logs of #lunar on IRC, from July 2003 to today, and its channel topics. Other dates from August 2002 onward come from the git history and release tags of the [Lunar repositories](https://github.com/lunar-linux). The moonlight calendar counts non-merge commits across the eight moonbase repositories, as of 21 November 2026.
