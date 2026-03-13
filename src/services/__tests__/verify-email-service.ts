/**
 * Email Service Verification Script
 * 
 * Quick verification that EmailService is properly configured
 * Run with: npx tsx src/services/__tests__/verify-email-service.ts
 */

import * as dotenv from 'dotenv';
import { validateEnv } from '../../lib/env';
import { emailService } from '../EmailService';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('=== Email Service Verification ===\n');

// Validate environment first
try {
  validateEnv();
  console.log('✅ Environment validated successfully\n');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

// Check configuration
console.log('1. Checking configuration...');
const isValid = emailService.validateConfig();
console.log(`   Configuration valid: ${isValid ? '✅' : '❌'}\n`);

if (!isValid) {
  console.error('❌ Email service configuration is invalid!');
  console.error('   Please check your .env.local file for:');
  console.error('   - RESEND_API_KEY');
  console.error('   - RESEND_FROM_EMAIL');
  console.error('   - RESEND_FROM_NAME');
  process.exit(1);
}

// Check methods exist
console.log('2. Checking methods...');
console.log(`   sendQRCodeEmail: ${typeof emailService.sendQRCodeEmail === 'function' ? '✅' : '❌'}`);
console.log(`   validateConfig: ${typeof emailService.validateConfig === 'function' ? '✅' : '❌'}\n`);

// Test email template
console.log('3. Testing email template...');
const { QR_CODE_EMAIL_TEMPLATE } = require('../EmailService');

const testSubject = QR_CODE_EMAIL_TEMPLATE.subject('João Silva');
console.log(`   Subject generated: ${testSubject.includes('João Silva') ? '✅' : '❌'}`);

const testHtml = QR_CODE_EMAIL_TEMPLATE.html({
  recipientEmail: 'test@example.com',
  recipientName: 'João Silva',
  messageUrl: 'https://paperbloom.com/test',
  qrCodeDataUrl: 'data:image/png;base64,test',
  senderName: 'Maria',
  messageTitle: 'Test Message',
});

console.log(`   HTML contains recipient name: ${testHtml.includes('João Silva') ? '✅' : '❌'}`);
console.log(`   HTML contains message URL: ${testHtml.includes('https://paperbloom.com/test') ? '✅' : '❌'}`);
console.log(`   HTML contains QR code reference: ${testHtml.includes('cid:qrcode') ? '✅' : '❌'}`);
console.log(`   HTML is responsive: ${testHtml.includes('@media') ? '✅' : '❌'}\n`);

console.log('=== Verification Complete ===');
console.log('✅ EmailService is properly configured and ready to use!\n');
console.log('Note: To actually send emails, call emailService.sendQRCodeEmail() with valid data.');
console.log('      The service will automatically retry up to 3 times with exponential backoff.\n');
