#!/usr/bin/env ts-node

/**
 * Test R2 Connection
 * 
 * This script tests the connection to Cloudflare R2 storage
 * and verifies that the bucket is accessible.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateEnv, env } from './env';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 Connection...\n');

  try {
    // Validate environment variables
    console.log('1️⃣ Validating environment variables...');
    validateEnv();
    console.log('✅ Environment variables validated\n');

    // Get R2 configuration
    const r2Config = env.r2;
    console.log('📋 R2 Configuration:');
    console.log(`   Bucket: ${r2Config.bucketName}`);
    console.log(`   Endpoint: ${r2Config.endpoint}`);
    console.log(`   Public URL: ${r2Config.publicUrl}`);
    console.log(`   Access Key: ${r2Config.accessKeyId.substring(0, 10)}...`);
    console.log('');

    // Initialize S3 client
    console.log('2️⃣ Initializing S3 client...');
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: r2Config.endpoint,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });
    console.log('✅ S3 client initialized\n');

    // Test listing objects
    console.log('3️⃣ Testing bucket access (listing objects)...');
    const listCommand = new ListObjectsV2Command({
      Bucket: r2Config.bucketName,
      MaxKeys: 5,
    });

    const listResponse = await s3Client.send(listCommand);
    console.log(`✅ Bucket accessible!`);
    console.log(`   Objects in bucket: ${listResponse.KeyCount || 0}`);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('   Recent objects:');
      listResponse.Contents.forEach((obj, index) => {
        console.log(`   ${index + 1}. ${obj.Key} (${(obj.Size || 0) / 1024} KB)`);
      });
    }
    console.log('');

    // Test upload (small test file)
    console.log('4️⃣ Testing upload capability...');
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testContent = `R2 Connection Test - ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    });

    await s3Client.send(putCommand);
    console.log('✅ Upload successful!');
    console.log(`   Test file: ${testKey}`);
    console.log(`   Public URL: ${r2Config.publicUrl}/${testKey}`);
    console.log('');

    // Summary
    console.log('🎉 All tests passed!');
    console.log('');
    console.log('✅ R2 is properly configured and working');
    console.log('✅ You can now upload images to R2');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Go to /editor/mensagem');
    console.log('   3. Upload an image to test the full flow');
    console.log('');
    console.log('📝 Note: You can delete the test file from R2 dashboard');
    console.log(`   Path: ${testKey}`);

  } catch (error) {
    console.error('❌ R2 Connection Test Failed!\n');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('');
      
      // Provide helpful error messages
      if (error.message.includes('Access Denied')) {
        console.error('💡 Troubleshooting:');
        console.error('   1. Check that R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are correct');
        console.error('   2. Verify the API token has read/write permissions');
        console.error('   3. Ensure the bucket name is correct');
      } else if (error.message.includes('NoSuchBucket')) {
        console.error('💡 Troubleshooting:');
        console.error('   1. Check that R2_BUCKET_NAME matches your bucket name');
        console.error('   2. Verify the bucket exists in your R2 dashboard');
      } else if (error.message.includes('Network')) {
        console.error('💡 Troubleshooting:');
        console.error('   1. Check your internet connection');
        console.error('   2. Verify R2_ENDPOINT is correct');
        console.error('   3. Check if there are any firewall restrictions');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testR2Connection();
