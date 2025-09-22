import { describe, expect, it } from 'vitest';

import { ComparatorType } from '../../../../src/const';
import { simpleComparison } from '../../../../src/nodes/get-entities/operators';

describe('operators', () => {
    describe('isEqual', () => {
        it('isEqual should return true for equal values', () => {
            expect(simpleComparison(ComparatorType.Is, 5, 5)).toBe(true);
            expect(simpleComparison(ComparatorType.Is, 'test', 'test')).toBe(
                true,
            );
        });

        it('isEqual should return false for unequal values', () => {
            expect(simpleComparison(ComparatorType.Is, 5, 10)).toBe(false);
            expect(simpleComparison(ComparatorType.Is, 'test', 'other')).toBe(
                false,
            );
        });
    });

    describe('isNotEqual', () => {
        it('isNotEqual should return true for unequal values', () => {
            expect(simpleComparison(ComparatorType.IsNot, 5, 10)).toBe(true);
            expect(
                simpleComparison(ComparatorType.IsNot, 'test', 'other'),
            ).toBe(true);
        });

        it('isNotEqual should return false for equal values', () => {
            expect(simpleComparison(ComparatorType.IsNot, 5, 5)).toBe(false);
            expect(simpleComparison(ComparatorType.IsNot, 'test', 'test')).toBe(
                false,
            );
        });
    });

    describe('contains', () => {
        it('contains should return true if array contains the value', () => {
            expect(
                simpleComparison(ComparatorType.Contains, [1, 2, 3], 2),
            ).toBe(true);
            expect(
                simpleComparison(ComparatorType.Contains, ['a', 'b', 'c'], 'b'),
            ).toBe(true);
        });

        it('contains should return false if array does not contain the value', () => {
            expect(
                simpleComparison(ComparatorType.Contains, [1, 2, 3], 4),
            ).toBe(false);
            expect(
                simpleComparison(ComparatorType.Contains, ['a', 'b', 'c'], 'd'),
            ).toBe(false);
        });
    });

    describe('doesNotContain', () => {
        it('doesNotContain should return false if array is not an array', () => {
            expect(
                simpleComparison(
                    ComparatorType.DoesNotContain,
                    'not an array',
                    2,
                ),
            ).toBe(false);
        });

        it('doesNotContain should return true if array does not contain the value', () => {
            expect(
                simpleComparison(ComparatorType.DoesNotContain, [1, 2, 3], 4),
            ).toBe(true);
            expect(
                simpleComparison(
                    ComparatorType.DoesNotContain,
                    ['a', 'b', 'c'],
                    'd',
                ),
            ).toBe(true);
            expect(
                simpleComparison(ComparatorType.DoesNotContain, [true], false),
            ).toBe(true);
        });

        it('doesNotContain should return false if array contains the value', () => {
            expect(
                simpleComparison(ComparatorType.DoesNotContain, [1, 2, 3], 2),
            ).toBe(false);
            expect(
                simpleComparison(
                    ComparatorType.DoesNotContain,
                    ['a', 'b', 'c'],
                    'b',
                ),
            ).toBe(false);
            expect(
                simpleComparison(ComparatorType.DoesNotContain, [true], true),
            ).toBe(false);
        });

        describe('includes', () => {
            it('should return true when a is included in the comma-separated list b', () => {
                const a = 'apple';
                const b = 'apple,banana,orange';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(true);
            });

            it('should return false when a is not included in the comma-separated list b', () => {
                const a = 'grape';
                const b = 'apple,banana,orange';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return false when a is not a string', () => {
                const a = 123;
                const b = 'apple,banana,orange';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return false when b is not a string', () => {
                const a = 'apple';
                const b = 123;
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return false when both a and b are not strings', () => {
                const a = 123;
                const b = 456;
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return false when b is an empty string', () => {
                const a = 'apple';
                const b = '';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return false when a is an empty string', () => {
                const a = '';
                const b = 'apple,banana,orange';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(false);
            });

            it('should return true when a matches an item in b with extra spaces trimmed', () => {
                const a = 'apple';
                const b = '  apple , banana , orange ';
                const result = simpleComparison(ComparatorType.Includes, a, b);
                expect(result).toBe(true);
            });
        });

        describe('doesNotInclude', () => {
            it('doesNotInclude should return true if string is not in the comma-separated list', () => {
                expect(
                    simpleComparison(
                        ComparatorType.DoesNotInclude,
                        'd',
                        'a,b,c',
                    ),
                ).toBe(true);
                expect(
                    simpleComparison(
                        ComparatorType.DoesNotInclude,
                        'e',
                        'a,b,c',
                    ),
                ).toBe(true);
            });

            it('doesNotInclude should return false if string is in the comma-separated list', () => {
                expect(
                    simpleComparison(
                        ComparatorType.DoesNotInclude,
                        'a',
                        'a,b,c',
                    ),
                ).toBe(false);
                expect(
                    simpleComparison(
                        ComparatorType.DoesNotInclude,
                        'b',
                        'a,b,c',
                    ),
                ).toBe(false);
            });
        });

        describe('startsWith', () => {
            it('startsWith should return true if string starts with the given prefix', () => {
                expect(
                    simpleComparison(ComparatorType.StartsWith, 'hello', 'he'),
                ).toBe(true);
                expect(
                    simpleComparison(ComparatorType.StartsWith, 'world', 'wo'),
                ).toBe(true);
            });

            it('startsWith should return false if string does not start with the given prefix', () => {
                expect(
                    simpleComparison(ComparatorType.StartsWith, 'hello', 'wo'),
                ).toBe(false);
                expect(
                    simpleComparison(ComparatorType.StartsWith, 'world', 'he'),
                ).toBe(false);
            });
        });

        describe('isNull', () => {
            it('isNull should return true for null values', () => {
                expect(simpleComparison(ComparatorType.IsNull, null)).toBe(
                    true,
                );
            });

            it('isNull should return false for non-null values', () => {
                expect(simpleComparison(ComparatorType.IsNull, 5)).toBe(false);
                expect(simpleComparison(ComparatorType.IsNull, 'test')).toBe(
                    false,
                );
            });

            it('isNotNull should return true for non-null values', () => {
                expect(simpleComparison(ComparatorType.IsNotNull, 5)).toBe(
                    true,
                );
                expect(simpleComparison(ComparatorType.IsNotNull, 'test')).toBe(
                    true,
                );
            });

            it('isNotNull should return false for null values', () => {
                expect(simpleComparison(ComparatorType.IsNotNull, null)).toBe(
                    false,
                );
            });
        });

        describe('isTrue', () => {
            it('isTrue should return true for true values', () => {
                expect(simpleComparison(ComparatorType.IsTrue, true)).toBe(
                    true,
                );
            });

            it('isTrue should return false for non-true values', () => {
                expect(simpleComparison(ComparatorType.IsTrue, false)).toBe(
                    false,
                );
                expect(simpleComparison(ComparatorType.IsTrue, null)).toBe(
                    false,
                );
            });
        });

        describe('isFalse', () => {
            it('isFalse should return true for false values', () => {
                expect(simpleComparison(ComparatorType.IsFalse, false)).toBe(
                    true,
                );
            });

            it('isFalse should return false for non-false values', () => {
                expect(simpleComparison(ComparatorType.IsFalse, true)).toBe(
                    false,
                );
                expect(simpleComparison(ComparatorType.IsFalse, null)).toBe(
                    false,
                );
            });
        });

        describe('regex', () => {
            it('regex should return true for matching patterns', () => {
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'hello',
                        'he.*',
                        false,
                    ),
                ).toBe(true);
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'world',
                        'wo.*',
                        false,
                    ),
                ).toBe(true);
            });

            it('regex should return false for non-matching patterns', () => {
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'hello',
                        'wo.*',
                        false,
                    ),
                ).toBe(false);
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'world',
                        'he.*',
                        false,
                    ),
                ).toBe(false);
            });

            it('regex should handle case sensitivity', () => {
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'Hello',
                        'he.*',
                        true,
                    ),
                ).toBe(true);
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'World',
                        'wo.*',
                        true,
                    ),
                ).toBe(true);
                expect(
                    simpleComparison(
                        ComparatorType.Regex,
                        'Hello',
                        'he.*',
                        false,
                    ),
                ).toBe(false);
            });
        });
    });
});
