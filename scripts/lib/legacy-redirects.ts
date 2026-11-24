/*
 * The old WordPress URLs and where they live now, read from docker/legacy-redirects.conf (the list
 * nginx answers with real 301s). Static hosts such as GitHub Pages can't send a 301, so the build
 * also writes a small page at each old URL that forwards at once (modules/legacy-redirects.ts).
 * Search engines treat an instant meta refresh like a permanent redirect; the canonical link says
 * the same, and the plain link is there for anyone whose browser doesn't follow it.
 *
 * No imports, and only TypeScript that Node can strip.
 */

export type LegacyRedirect = { from: string, to: string }

/** `location ^~ /2005/03/07/slug { return 301 /news/2005-03-07-slug/; }` → { from, to } */
export const parseLegacyRedirects = (conf: string): LegacyRedirect[] =>
  [...conf.matchAll(/^location \^~ (\/\S+)\s+\{ return 301 (\S+); \}$/gm)]
    .map(([, from, to]) => ({ from: from!, to: to! }))

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

/** The page served at an old URL: `href` is where the browser goes, `canonical` the absolute URL. */
export const legacyRedirectPage = (href: string, canonical: string) => {
  const target = escapeHtml(href)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved · Lunar Linux</title>
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p>This page has moved to <a href="${target}">${escapeHtml(canonical)}</a>.</p>
</body>
</html>
`
}
