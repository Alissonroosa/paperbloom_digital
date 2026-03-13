import { isValidYouTubeUrl, youtubeUrlSchema, validateCreateMessage } from '../message';

console.log('=== YouTube URL Validation Tests ===\n');

// Test 1: youtube.com/watch?v= format
console.log('Test 1: youtube.com/watch?v= format');
const test1 = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube.com/watch?v=dQw4w9WgXcQ',
];
test1.forEach(url => {
  const result = isValidYouTubeUrl(url);
  console.log(`  ${url}: ${result ? '✓' : '✗'}`);
});

// Test 2: youtu.be format
console.log('\nTest 2: youtu.be format');
const test2 = [
  'https://youtu.be/dQw4w9WgXcQ',
  'http://youtu.be/dQw4w9WgXcQ',
  'youtu.be/dQw4w9WgXcQ',
];
test2.forEach(url => {
  const result = isValidYouTubeUrl(url);
  console.log(`  ${url}: ${result ? '✓' : '✗'}`);
});

// Test 3: youtube.com/embed format
console.log('\nTest 3: youtube.com/embed format');
const test3 = [
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'http://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://youtube.com/embed/dQw4w9WgXcQ',
  'youtube.com/embed/dQw4w9WgXcQ',
];
test3.forEach(url => {
  const result = isValidYouTubeUrl(url);
  console.log(`  ${url}: ${result ? '✓' : '✗'}`);
});

// Test 4: Invalid URLs (should be rejected)
console.log('\nTest 4: Invalid URLs (should be rejected)');
const test4 = [
  'https://vimeo.com/123456',
  'https://www.google.com',
  'not a url',
  '',
  'https://youtube.com',
];
test4.forEach(url => {
  const result = isValidYouTubeUrl(url);
  console.log(`  ${url}: ${result ? '✗ (should be false)' : '✓'}`);
});

// Test 5: URLs with additional parameters
console.log('\nTest 5: URLs with additional parameters');
const test5 = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxyz',
];
test5.forEach(url => {
  const result = isValidYouTubeUrl(url);
  console.log(`  ${url}: ${result ? '✓' : '✗'}`);
});

// Test 6: Integration with message validation schema
console.log('\nTest 6: Integration with message validation schema');
const validMessage = {
  recipientName: 'John Doe',
  senderName: 'Jane Smith',
  messageText: 'Happy Birthday!',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};
const validResult = validateCreateMessage(validMessage);
console.log(`  Valid message with YouTube URL: ${validResult.success ? '✓' : '✗'}`);

const invalidMessage = {
  recipientName: 'John Doe',
  senderName: 'Jane Smith',
  messageText: 'Happy Birthday!',
  youtubeUrl: 'https://vimeo.com/123456',
};
const invalidResult = validateCreateMessage(invalidMessage);
console.log(`  Invalid message with non-YouTube URL: ${!invalidResult.success ? '✓' : '✗'}`);
if (!invalidResult.success) {
  console.log(`    Error: ${invalidResult.error.issues[0].message}`);
}

// Test 7: Optional YouTube URL
console.log('\nTest 7: Optional YouTube URL (should work without it)');
const messageWithoutYoutube = {
  recipientName: 'John Doe',
  senderName: 'Jane Smith',
  messageText: 'Happy Birthday!',
};
const optionalResult = validateCreateMessage(messageWithoutYoutube);
console.log(`  Message without YouTube URL: ${optionalResult.success ? '✓' : '✗'}`);

console.log('\n=== All Tests Complete ===');
