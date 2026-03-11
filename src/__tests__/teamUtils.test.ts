import { getInitials } from '../utils/avatarUtils';

describe('getInitials', () => {
  it('returns two uppercase initials for a two-word name', () => {
    expect(getInitials('João Silva')).toBe('JS');
  });

  it('returns two initials for a three-word name (ignores third word)', () => {
    expect(getInitials('João Miguel Silva')).toBe('JM');
  });

  it('returns uppercased initials even when input is lowercase', () => {
    expect(getInitials('rui ferreira')).toBe('RF');
  });

  it('returns a single initial for a single-word name', () => {
    // A team named with one word only produces a 1-char result,
    // which may show as a visually odd single-letter avatar.
    expect(getInitials('Relâmpago')).toBe('R');
  });

  it('returns empty string for an empty input', () => {
    expect(getInitials('')).toBe('');
  });

  it('returns empty string for a string of only spaces', () => {
    expect(getInitials('   ')).toBe('');
  });

  it('collapses multiple spaces between words correctly', () => {
    expect(getInitials('João  Silva')).toBe('JS');
  });

  it('limits output to at most 2 characters', () => {
    // Even if something weird goes through, slice(0,2) protects us
    const result = getInitials('A B');
    expect(result.length).toBeLessThanOrEqual(2);
  });

  // BUG: a name like "X" produces "X" (one char) — the avatar circle renders
  // with only one letter. This is aesthetic but worth documenting.
  it('BUG: single-char name produces a 1-char initial instead of a placeholder', () => {
    expect(getInitials('X')).toBe('X'); // documents current behaviour
  });
});
