/**
 * Project keys prefix issue identifiers (for example WEB-12). The API accepts
 * 2-10 ASCII letters or digits that start with a letter; these helpers keep the
 * create form inside that contract instead of failing on submit.
 */

export const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;

export function isValidProjectKey(key: string): boolean {
  return PROJECT_KEY_PATTERN.test(key);
}

/** Uppercase, drop characters the API rejects, and drop leading digits. */
export function normalizeProjectKey(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^[0-9]+/, '')
    .slice(0, 10);
}

/**
 * Suggest a key from a project name: initials for several words ("Mobile App"
 * -> "MA"), the first three letters for one word ("Website" -> "WEB"). Returns
 * an empty string when the name has no usable ASCII letters, so the person
 * types a key instead of submitting an invalid one.
 */
export function suggestProjectKey(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^[0-9]+/, ''))
    .filter(Boolean);
  if (words.length === 0) return '';

  const initials = normalizeProjectKey(words.map((word) => word[0]).join('')).slice(0, 6);
  if (words.length > 1 && initials.length >= 2) return initials;

  const fromLetters = normalizeProjectKey(words.join('')).slice(0, 3);
  return fromLetters.length >= 2 ? fromLetters : '';
}
