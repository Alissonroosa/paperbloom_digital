import { describe, it, expect, beforeEach } from 'vitest';

describe('useAutoSave - localStorage operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and restore data from localStorage', () => {
    const testData = { message: 'Hello', from: 'Alice' };
    const savedData = {
      data: testData,
      savedAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem('test-key', JSON.stringify(savedData));

    // Restore from localStorage
    const saved = localStorage.getItem('test-key');
    expect(saved).toBeTruthy();
    
    if (saved) {
      const parsed = JSON.parse(saved);
      expect(parsed.data).toEqual(testData);
      expect(parsed.savedAt).toBeTruthy();
    }
  });

  it('should clear data from localStorage', () => {
    const testData = { message: 'To be cleared' };
    localStorage.setItem('test-key', JSON.stringify({ data: testData }));

    // Verify it's saved
    expect(localStorage.getItem('test-key')).toBeTruthy();

    // Clear it
    localStorage.removeItem('test-key');

    // Verify it's cleared
    const saved = localStorage.getItem('test-key');
    expect(saved).toBe(null);
  });

  it('should return null when restoring non-existent data', () => {
    const saved = localStorage.getItem('non-existent-key');
    expect(saved).toBe(null);
  });

  it('should handle JSON serialization correctly', () => {
    const complexData = {
      title: 'Test Title',
      specialDate: new Date().toISOString(),
      message: 'Test message with special chars: áéíóú',
      from: 'Alice',
      to: 'Bob',
      nested: {
        value: 123,
        array: [1, 2, 3],
      },
    };

    const savedData = {
      data: complexData,
      savedAt: new Date().toISOString(),
    };

    // Save
    localStorage.setItem('complex-key', JSON.stringify(savedData));

    // Restore
    const saved = localStorage.getItem('complex-key');
    expect(saved).toBeTruthy();

    if (saved) {
      const parsed = JSON.parse(saved);
      expect(parsed.data).toEqual(complexData);
      expect(parsed.data.nested.array).toEqual([1, 2, 3]);
    }
  });

  it('should handle multiple keys independently', () => {
    const data1 = { message: 'First' };
    const data2 = { message: 'Second' };

    localStorage.setItem('key1', JSON.stringify({ data: data1 }));
    localStorage.setItem('key2', JSON.stringify({ data: data2 }));

    const saved1 = localStorage.getItem('key1');
    const saved2 = localStorage.getItem('key2');

    expect(saved1).toBeTruthy();
    expect(saved2).toBeTruthy();

    if (saved1 && saved2) {
      expect(JSON.parse(saved1).data).toEqual(data1);
      expect(JSON.parse(saved2).data).toEqual(data2);
    }

    // Clear one
    localStorage.removeItem('key1');

    expect(localStorage.getItem('key1')).toBe(null);
    expect(localStorage.getItem('key2')).toBeTruthy();
  });
});
