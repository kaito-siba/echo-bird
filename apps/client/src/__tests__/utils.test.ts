import { describe, expect, it } from 'vitest';

// シンプルなユーティリティ関数の例
function add(a: number, b: number): number {
  return a + b;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

describe('Utility Functions', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle different dates', () => {
      const date = new Date('2023-12-31T23:59:59Z');
      expect(formatDate(date)).toBe('2023-12-31');
    });
  });

  describe('basic assertions', () => {
    it('should work with basic expect assertions', () => {
      expect(true).toBe(true);
      expect('hello').toMatch(/hello/);
      expect([1, 2, 3]).toContain(2);
      expect({ name: 'test' }).toHaveProperty('name');
    });
  });
});
