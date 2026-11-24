import { formatDate } from './formatDate'

type DescribedModule = {
  name: string
  version: string | null
  short: string | null
  lastChange: { date: string } | null
}

/**
 * A module page's meta description, from what the page shows: name, version, the DETAILS short
 * description, when it last changed and how to install it.
 * "firefox 160.0 for Lunar Linux: A web browser from mozilla.org. Updated November 20, 2026; install with lin firefox."
 */
export const moduleDescription = ({ name, version, short, lastChange }: DescribedModule) => {
  const head = [name, version].filter(Boolean).join(' ')
  const what = short?.trim().replace(/\.+$/, '')
  const install = `install with lin ${name}.`
  const tail = lastChange ? `Updated ${formatDate(lastChange.date)}; ${install}` : `${install[0]!.toUpperCase()}${install.slice(1)}`
  return what ? `${head} for Lunar Linux: ${what}. ${tail}` : `${head} for Lunar Linux. ${tail}`
}
