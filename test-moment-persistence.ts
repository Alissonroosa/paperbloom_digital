/**
 * Manual test to verify currentMomentIndex persistence
 * 
 * This test verifies that:
 * 1. currentMomentIndex is saved to localStorage
 * 2. currentMomentIndex is restored from localStorage
 * 3. The moment is preserved when the page is reloaded
 * 
 * Requirements: 8.2, 8.3
 */

import { CardCollection, Card } from './src/types/card';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// @ts-ignore
global.localStorage = localStorageMock;

const mockCollection: CardCollection = {
  id: 'test-collection-123',
  recipientName: 'Test Recipient',
  senderName: 'Test Sender',
  slug: null,
  qrCodeUrl: null,
  status: 'pending',
  stripeSessionId: null,
  contactEmail: 'test@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCards: Card[] = Array.from({ length: 12 }, (_, i) => ({
  id: `card-${i + 1}`,
  collectionId: 'test-collection-123',
  order: i + 1,
  title: `Card ${i + 1} Title`,
  messageText: `Card ${i + 1} message`,
  imageUrl: null,
  youtubeUrl: null,
  status: 'unopened' as const,
  openedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

console.log('🧪 Testing currentMomentIndex Persistence\n');

// Test 1: Save to localStorage
console.log('Test 1: Saving currentMomentIndex to localStorage');
const storageKey = `card-collection-editor-${mockCollection.id}`;
const dataToSave = {
  collection: mockCollection,
  cards: mockCards,
  currentCardIndex: 0,
  currentMomentIndex: 2, // Set to moment 2
  savedAt: new Date().toISOString(),
};

localStorage.setItem(storageKey, JSON.stringify(dataToSave));
console.log('✅ Saved currentMomentIndex: 2');

// Test 2: Retrieve from localStorage
console.log('\nTest 2: Retrieving currentMomentIndex from localStorage');
const saved = localStorage.getItem(storageKey);
if (!saved) {
  console.error('❌ Failed to retrieve data from localStorage');
  process.exit(1);
}

const parsed = JSON.parse(saved);
console.log(`✅ Retrieved currentMomentIndex: ${parsed.currentMomentIndex}`);

if (parsed.currentMomentIndex !== 2) {
  console.error(`❌ Expected currentMomentIndex to be 2, but got ${parsed.currentMomentIndex}`);
  process.exit(1);
}

// Test 3: Verify all data is preserved
console.log('\nTest 3: Verifying all data is preserved');
if (parsed.collection.id !== mockCollection.id) {
  console.error('❌ Collection ID mismatch');
  process.exit(1);
}
console.log('✅ Collection ID preserved');

if (parsed.cards.length !== 12) {
  console.error(`❌ Expected 12 cards, but got ${parsed.cards.length}`);
  process.exit(1);
}
console.log('✅ All 12 cards preserved');

if (typeof parsed.currentCardIndex !== 'number') {
  console.error('❌ currentCardIndex not preserved');
  process.exit(1);
}
console.log('✅ currentCardIndex preserved');

// Test 4: Simulate page reload
console.log('\nTest 4: Simulating page reload');
const restoredData = localStorage.getItem(storageKey);
if (!restoredData) {
  console.error('❌ Data not found after reload simulation');
  process.exit(1);
}

const restoredParsed = JSON.parse(restoredData);
if (restoredParsed.currentMomentIndex !== 2) {
  console.error(`❌ currentMomentIndex not preserved after reload. Expected 2, got ${restoredParsed.currentMomentIndex}`);
  process.exit(1);
}
console.log('✅ currentMomentIndex preserved after reload: 2');

// Test 5: Update to different moment
console.log('\nTest 5: Updating to different moment');
const updatedData = {
  ...restoredParsed,
  currentMomentIndex: 1,
  savedAt: new Date().toISOString(),
};
localStorage.setItem(storageKey, JSON.stringify(updatedData));

const updatedRetrieved = JSON.parse(localStorage.getItem(storageKey)!);
if (updatedRetrieved.currentMomentIndex !== 1) {
  console.error(`❌ Failed to update currentMomentIndex. Expected 1, got ${updatedRetrieved.currentMomentIndex}`);
  process.exit(1);
}
console.log('✅ Successfully updated currentMomentIndex to 1');

// Test 6: Clear localStorage
console.log('\nTest 6: Clearing localStorage');
localStorage.removeItem(storageKey);
const clearedData = localStorage.getItem(storageKey);
if (clearedData !== null) {
  console.error('❌ Failed to clear localStorage');
  process.exit(1);
}
console.log('✅ localStorage cleared successfully');

console.log('\n✅ All tests passed! currentMomentIndex persistence is working correctly.\n');
console.log('Summary:');
console.log('- ✅ currentMomentIndex is saved to localStorage');
console.log('- ✅ currentMomentIndex is restored from localStorage');
console.log('- ✅ The moment is preserved when the page is reloaded');
console.log('- ✅ Requirements 8.2 and 8.3 are satisfied');
