/**
 * Verify QR code resolution meets minimum 300x300 requirement
 * Run with: npx ts-node --project tsconfig.node.json src/services/__tests__/verify-qrcode-resolution.ts
 */

import { qrCodeService } from '../QRCodeService';
import sharp from 'sharp';
import path from 'path';

async function verifyQRCodeResolution() {
  console.log('🧪 Testing QR Code Resolution (Requirement 9.1)...\n');

  const testMessageId = 'resolution-test-' + Date.now();
  const testUrl = 'https://paperbloom.com/mensagem/test/123';

  try {
    // Generate QR code
    console.log('✓ Generating QR code...');
    const qrCodeUrl = await qrCodeService.generate(testUrl, testMessageId);
    console.log(`  Generated: ${qrCodeUrl}\n`);

    // Read and check dimensions using sharp
    const filePath = path.join(process.cwd(), 'public', qrCodeUrl);
    const metadata = await sharp(filePath).metadata();

    console.log('📏 QR Code Dimensions:');
    console.log(`  Width: ${metadata.width}px`);
    console.log(`  Height: ${metadata.height}px`);
    console.log(`  Format: ${metadata.format}\n`);

    // Verify minimum resolution (Requirement 9.1)
    const minResolution = 300;
    if (metadata.width && metadata.height) {
      if (metadata.width >= minResolution && metadata.height >= minResolution) {
        console.log(`✅ Resolution meets minimum requirement (${minResolution}x${minResolution})`);
        console.log('✅ Requirement 9.1 validated: QR codes meet minimum resolution\n');
      } else {
        console.log(`❌ Resolution does not meet minimum requirement`);
        console.log(`   Expected: >= ${minResolution}x${minResolution}`);
        console.log(`   Actual: ${metadata.width}x${metadata.height}\n`);
        process.exit(1);
      }
    }

    // Clean up
    await qrCodeService.delete(qrCodeUrl);
    console.log('🎉 Resolution test passed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

verifyQRCodeResolution();
