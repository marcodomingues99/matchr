import { parseDatePt, PT_MONTHS, MONTHS } from '../utils/constants';

describe('parseDatePt', () => {
  it('parses a typical Portuguese date string', () => {
    const d = parseDatePt('5 Abr 2026');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(3);   // April is 0-based 3
    expect(d!.getDate()).toBe(5);
  });

  it('parses the first day of January', () => {
    const d = parseDatePt('1 Jan 2025');
    expect(d).not.toBeNull();
    expect(d!.getMonth()).toBe(0);
    expect(d!.getDate()).toBe(1);
  });

  it('parses the last month (Dez)', () => {
    const d = parseDatePt('31 Dez 2024');
    expect(d).not.toBeNull();
    expect(d!.getMonth()).toBe(11);
    expect(d!.getDate()).toBe(31);
  });

  it('handles extra leading/trailing whitespace', () => {
    const d = parseDatePt('  14 Mar 2026  ');
    expect(d).not.toBeNull();
    expect(d!.getMonth()).toBe(2);
    expect(d!.getDate()).toBe(14);
  });

  it('handles multiple spaces between parts', () => {
    const d = parseDatePt('14  Mar  2026');
    expect(d).not.toBeNull();
    expect(d!.getMonth()).toBe(2);
  });

  it('returns null for an unknown month abbreviation', () => {
    expect(parseDatePt('5 April 2026')).toBeNull();  // English month name
    expect(parseDatePt('5 Xyz 2026')).toBeNull();
  });

  it('returns null when fewer than 3 parts', () => {
    expect(parseDatePt('Mar 2026')).toBeNull();
    expect(parseDatePt('2026')).toBeNull();
    expect(parseDatePt('')).toBeNull();
  });

  it('returns null when day is not a number', () => {
    expect(parseDatePt('abc Mar 2026')).toBeNull();
  });

  it('returns null when year is not a number', () => {
    expect(parseDatePt('5 Mar xxxx')).toBeNull();
  });

  it('rejects day 0', () => {
    expect(parseDatePt('0 Mar 2026')).toBeNull();
  });

  it('rejects out-of-range day 32', () => {
    expect(parseDatePt('32 Mar 2026')).toBeNull();
  });
});

describe('PT_MONTHS / MONTHS consistency', () => {
  it('PT_MONTHS has exactly 12 entries', () => {
    expect(PT_MONTHS).toHaveLength(12);
  });

  it('PT_MONTHS entries match MONTHS keys in order', () => {
    const keys = Object.keys(MONTHS);
    expect(PT_MONTHS).toEqual(keys);
  });

  it('each PT_MONTHS entry maps back to the correct 0-based index', () => {
    PT_MONTHS.forEach((abbr, idx) => {
      expect(MONTHS[abbr]).toBe(idx);
    });
  });
});
