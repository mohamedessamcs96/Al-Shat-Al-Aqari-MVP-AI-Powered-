/**
 * Standalone formatting utilities — no mock data dependencies.
 */

/**
 * Format a SAR price value into a human-readable Arabic locale string.
 * e.g. 1_250_000 → "1,250,000 ر.س"
 */
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return '—';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Return a city name from a city ID string.
 * Uses a cached map populated by the API (see citiesCache below).
 * Falls back to the ID itself if not found.
 */
const citiesCache: Record<string, string> = {};

export function setCitiesCache(cities: { id: string; name: string }[]) {
  cities.forEach((c) => {
    citiesCache[c.id] = c.name;
  });
}

export function getCityName(cityId: string | undefined | null): string {
  if (!cityId) return '—';
  return citiesCache[cityId] ?? cityId;
}
