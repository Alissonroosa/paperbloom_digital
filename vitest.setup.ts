import { beforeEach } from 'vitest';
import pool from './src/lib/db';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Make React globally available for JSX
(global as any).React = React;

// Mock localStorage for browser-only tests
if (typeof window === 'undefined') {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

// Clean up test data before each test
beforeEach(async () => {
  try {
    // Delete all test messages (keep production data safe by only deleting test data)
    // In a real scenario, you'd use a separate test database
    await pool.query('DELETE FROM messages WHERE recipient_name LIKE $1', ['Recipient%']);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});
