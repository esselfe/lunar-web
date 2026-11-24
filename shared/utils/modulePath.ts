/**
 * A module page's path, with a trailing slash like every page URL on the site. Names that end like
 * a file extension (`webkit2gtk-4.1`, `CGI.pm`, `fltk1.3`) need it most: without it, the
 * prerenderer takes the link for a file and never builds the page.
 */
export const modulePath = (name: string) => `/modules/${name}/`
