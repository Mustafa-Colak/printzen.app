export type Locale = 'en' | 'tr';

/** Given the current pathname and its locale, returns the equivalent path in the other locale. */
// Bölüm karşılıkları: EN yolu → TR yolu. TR'de rehber/yazıcı sayfaları farklı slug'larla çalışır.
const SECTION_EN_TO_TR: Record<string, string> = {
  guides: 'rehberler',
  printers: 'yazicilar',
  'test-print': 'test-baski',
};
const SECTION_TR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_EN_TO_TR).map(([en, tr]) => [tr, en]),
);

/** Given the current pathname and its locale, returns the equivalent path in the other locale. */
function mapSection(parts: string[], map: Record<string, string>): string {
  const mapped = parts.map((part, i) => (i === 0 ? (map[part] ?? part) : part));
  return mapped.length ? `/${mapped.join('/')}/` : '/';
}

export function getAlternatePath(pathname: string, lang: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (lang === 'en') {
    return parts.length ? `/tr${mapSection(parts, SECTION_EN_TO_TR)}` : '/tr/';
  }
  // TR → EN: önce /tr öneki atılır
  const withoutLocale = parts[0] === 'tr' ? parts.slice(1) : parts;
  return mapSection(withoutLocale, SECTION_TR_TO_EN);
}
