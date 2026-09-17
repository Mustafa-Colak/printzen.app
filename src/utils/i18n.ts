export type Locale = 'en' | 'tr';

/** Given the current pathname and its locale, returns the equivalent path in the other locale. */
export function getAlternatePath(pathname: string, lang: Locale): string {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (lang === 'en') {
    return normalized === '/' ? '/tr/' : `/tr${normalized}`;
  }
  return normalized.replace(/^\/tr\/?/, '/');
}
