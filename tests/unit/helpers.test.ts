import { toMinorUnit, fromMinorUnit, generateReference, hashRequest } from '../../src/shared/utils/helpers';

describe('helpers', () => {
  test('toMinorUnit converts NGN to kobo', () => {
    expect(toMinorUnit(100)).toBe(10000);
    expect(toMinorUnit(0.5)).toBe(50);
    expect(toMinorUnit(1000.99)).toBe(100099);
  });

  test('fromMinorUnit converts kobo to NGN', () => {
    expect(fromMinorUnit(10000)).toBe(100);
    expect(fromMinorUnit(50)).toBe(0.5);
  });

  test('generateReference returns prefixed string', () => {
    const ref = generateReference('FUND');
    expect(ref).toMatch(/^FUND-/);
  });

  test('hashRequest produces consistent hash', () => {
    const h1 = hashRequest({ amount: 100 });
    const h2 = hashRequest({ amount: 100 });
    expect(h1).toBe(h2);
    expect(hashRequest({ amount: 200 })).not.toBe(h1);
  });
});
