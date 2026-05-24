#!/usr/bin/env ts-node

/**
 * Upload das logos (Mercado Pago, Mercado Livre, WhatsApp) para o R2,
 * em loja/assets/{logo}.svg. Uso pontual — executar uma vez.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateEnv, env } from './env';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SOURCE_FOLDER = 'Logo Mercado Pago';

const LOGOS: Array<{ file: string; key: string }> = [
  { file: 'MP_RGB_HANDSHAKE_color_horizontal.svg', key: 'loja/assets/mercado-pago.svg' },
  { file: 'mercado-livre.svg', key: 'loja/assets/mercado-envios.svg' },
  { file: 'whatsapp-color-svgrepo-com.svg', key: 'loja/assets/whatsapp.svg' },
];

async function uploadLogos() {
  validateEnv();
  const r2 = env.r2;
  const s3 = new S3Client({
    region: 'auto',
    endpoint: r2.endpoint,
    credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
  });

  for (const { file, key } of LOGOS) {
    const filePath = path.join(process.cwd(), SOURCE_FOLDER, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Não encontrado: ${filePath}`);
      continue;
    }

    const body = fs.readFileSync(filePath);

    await s3.send(
      new PutObjectCommand({
        Bucket: r2.bucketName,
        Key: key,
        Body: body,
        ContentType: 'image/svg+xml',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    console.log(`✅ ${file} -> ${r2.publicUrl}/${key}`);
  }
}

uploadLogos().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
