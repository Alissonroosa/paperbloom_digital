/**
 * Test script for Card Collection Email Template
 * 
 * This script tests the card collection email template rendering
 * and validates that all required elements are present.
 */

import { CARD_COLLECTION_EMAIL_TEMPLATE, CardCollectionEmailData } from './src/services/EmailService';

// Mock data for testing
const mockData: CardCollectionEmailData = {
  recipientEmail: 'sender@example.com',
  recipientName: 'Ana Costa',
  senderName: 'Pedro Silva',
  collectionUrl: 'https://paperbloom.com/cartas/abc123-def456',
  qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};

console.log('🧪 Testing Card Collection Email Template\n');

// Test 1: Subject line
console.log('✅ Test 1: Subject Line');
const subject = CARD_COLLECTION_EMAIL_TEMPLATE.subject(mockData.recipientName);
console.log(`   Subject: ${subject}`);
console.log(`   Contains recipient name: ${subject.includes(mockData.recipientName) ? '✓' : '✗'}`);
console.log(`   Contains "12 Cartas": ${subject.includes('12 Cartas') ? '✓' : '✗'}`);
console.log(`   Contains emoji: ${subject.includes('💌') ? '✓' : '✗'}`);
console.log('');

// Test 2: HTML content
console.log('✅ Test 2: HTML Content');
const html = CARD_COLLECTION_EMAIL_TEMPLATE.html(mockData);

// Check for required elements
const checks = [
  { name: 'Recipient name', value: mockData.recipientName },
  { name: 'Sender name', value: mockData.senderName },
  { name: 'Collection URL', value: mockData.collectionUrl },
  { name: 'QR code reference', value: 'cid:qrcode' },
  { name: '"12 Cartas" branding', value: '12 Cartas' },
  { name: 'Journey tagline', value: 'Uma Jornada Emocional Única' },
  { name: 'One-time opening note', value: 'só pode ser aberta uma única vez' },
  { name: 'Sharing instructions', value: 'Como Compartilhar' },
  { name: 'How it works section', value: 'Como Funciona' },
  { name: 'WhatsApp mention', value: 'WhatsApp' },
  { name: 'Print suggestion', value: 'Imprima' },
  { name: 'Paper Bloom branding', value: 'Paper Bloom' },
  { name: 'Responsive design', value: 'max-width: 600px' },
  { name: 'Mobile media query', value: '@media only screen and (max-width: 600px)' },
  { name: 'Gradient hero', value: 'linear-gradient' },
];

checks.forEach(check => {
  const found = html.includes(check.value);
  console.log(`   ${found ? '✓' : '✗'} ${check.name}`);
});

console.log('');

// Test 3: Visual elements
console.log('✅ Test 3: Visual Elements');
const visualElements = [
  { name: 'Gift emoji 🎁', value: '🎁' },
  { name: 'Letter emoji 💌', value: '💌' },
  { name: 'Sparkles emoji ✨', value: '✨' },
  { name: 'Primary color #4F46E5', value: '#4F46E5' },
  { name: 'Button styling', value: 'class="button"' },
];

visualElements.forEach(element => {
  const found = html.includes(element.value);
  console.log(`   ${found ? '✓' : '✗'} ${element.name}`);
});

console.log('');

// Test 4: Structure
console.log('✅ Test 4: HTML Structure');
const structureChecks = [
  { name: 'DOCTYPE declaration', value: '<!DOCTYPE html>' },
  { name: 'UTF-8 charset', value: 'charset="utf-8"' },
  { name: 'Viewport meta', value: 'viewport' },
  { name: 'Container div', value: 'class="container"' },
  { name: 'Header section', value: 'class="header"' },
  { name: 'Hero section', value: 'class="hero"' },
  { name: 'QR code section', value: 'class="qr-code"' },
  { name: 'URL section', value: 'class="message-url"' },
  { name: 'Special note section', value: 'class="special-note"' },
  { name: 'Instructions section', value: 'class="instructions"' },
  { name: 'Footer section', value: 'class="footer"' },
];

structureChecks.forEach(check => {
  const found = html.includes(check.value);
  console.log(`   ${found ? '✓' : '✗'} ${check.name}`);
});

console.log('');

// Test 5: Accessibility
console.log('✅ Test 5: Accessibility');
const accessibilityChecks = [
  { name: 'Alt text for QR code', value: 'alt="QR Code das 12 Cartas' },
  { name: 'Semantic HTML (h1, h2, h3)', value: '<h1>' },
  { name: 'Proper link structure', value: '<a href=' },
];

accessibilityChecks.forEach(check => {
  const found = html.includes(check.value);
  console.log(`   ${found ? '✓' : '✗'} ${check.name}`);
});

console.log('');

// Summary
console.log('📊 Summary');
console.log(`   Template length: ${html.length} characters`);
console.log(`   Subject length: ${subject.length} characters`);
console.log('');

console.log('✅ All tests completed!');
console.log('');
console.log('💡 To view the rendered HTML:');
console.log('   1. Copy the HTML output below');
console.log('   2. Save it as test-email.html');
console.log('   3. Open in a browser');
console.log('');
console.log('=' .repeat(80));
console.log('HTML OUTPUT:');
console.log('=' .repeat(80));
console.log(html);
console.log('=' .repeat(80));
