import { isValidProjectKey, normalizeProjectKey, suggestProjectKey } from '../project-key';

describe('suggestProjectKey', () => {
  it('uses initials for multi-word names', () => {
    expect(suggestProjectKey('Mobile App')).toBe('MA');
    expect(suggestProjectKey('Customer support portal')).toBe('CSP');
  });

  it('uses the first three letters for a single word instead of one letter', () => {
    expect(suggestProjectKey('Website')).toBe('WEB');
    expect(suggestProjectKey('Test')).toBe('TES');
  });

  it('never starts with a digit', () => {
    expect(suggestProjectKey('2026 Roadmap')).toBe('ROA');
    expect(isValidProjectKey(suggestProjectKey('2026 Roadmap'))).toBe(true);
  });

  it('returns an empty key when the name has no ASCII letters', () => {
    expect(suggestProjectKey('مشروع')).toBe('');
    expect(suggestProjectKey('   ')).toBe('');
  });

  it('always suggests keys the API accepts', () => {
    for (const name of ['Website', 'Mobile App', 'A B C D E F G H', 'x', 'Q3 launch', 'ops-2']) {
      const key = suggestProjectKey(name);
      if (key) expect(isValidProjectKey(key)).toBe(true);
    }
  });
});

describe('normalizeProjectKey', () => {
  it('uppercases, strips invalid characters and leading digits, and caps length', () => {
    expect(normalizeProjectKey('9web-app_v2')).toBe('WEBAPPV2');
    expect(normalizeProjectKey('abcdefghijklmnop')).toBe('ABCDEFGHIJ');
  });
});

describe('isValidProjectKey', () => {
  it('matches the API contract', () => {
    expect(isValidProjectKey('WEB')).toBe(true);
    expect(isValidProjectKey('W')).toBe(false);
    expect(isValidProjectKey('1WEB')).toBe(false);
    expect(isValidProjectKey('ABCDEFGHIJK')).toBe(false);
  });
});
