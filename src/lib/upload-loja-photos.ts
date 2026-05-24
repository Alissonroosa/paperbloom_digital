#!/usr/bin/env ts-node

/**
 * Upload das fotos da coleção Dia dos Namorados 2026 para o R2.
 * Lê arquivos da pasta local "Fotos Produtos Namorados/" e sobe para
 * loja/dia-dos-namorados-2026/{slug}/foto-{N}.jpg
 *
 * Uso: npx ts-node src/lib/upload-loja-photos.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { validateEnv, env } from './env';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const COLLECTION_SLUG = 'dia-dos-namorados-2026';
const ROOT_FOLDER = 'Fotos Produtos Namorados';

// folder name -> product slug
const FOLDER_TO_SLUG: Record<string, string> = {
  'Verdade ou Beijo Romance': 'verdade-ou-beijo-romance',
  'Verdade ou Beijo Hot': 'verdade-ou-beijo-hot',
  'Baralho Personalizado': 'baralho-personalizado-casal',
  'Caixa Explosão': 'caixa-explosao-caneca-personalizada',
  'Quadro Polaroid': 'quadro-9-polaroids-fio-de-fada',
  'Livro - Nossas Memorias': 'livro-nossas-memorias',
};

async function uploadAll() {
  validateEnv();
  const r2 = env.r2;
  const s3 = new S3Client({
    region: 'auto',
    endpoint: r2.endpoint,
    credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
  });

  const results: Record<string, string[]> = {};

  for (const [folder, slug] of Object.entries(FOLDER_TO_SLUG)) {
    const folderPath = path.join(process.cwd(), ROOT_FOLDER, folder);
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Pasta nao encontrada: ${folderPath}`);
      continue;
    }

    const files = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    console.log(`\n📁 ${folder} (${files.length} fotos) -> ${slug}`);
    results[slug] = [];

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filePath = path.join(folderPath, filename);
      const buffer = fs.readFileSync(filePath);

      // Otimiza para web: max 1600px no lado maior, JPEG qualidade 85
      const processed = await sharp(buffer)
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();

      const key = `loja/${COLLECTION_SLUG}/${slug}/foto-${i + 1}.jpg`;

      await s3.send(
        new PutObjectCommand({
          Bucket: r2.bucketName,
          Key: key,
          Body: processed,
          ContentType: 'image/jpeg',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const url = `${r2.publicUrl}/${key}`;
      results[slug].push(url);
      console.log(`  ✅ ${filename} -> ${url}`);
    }
  }

  console.log('\n\n========== JSON pronto pra colar ==========\n');
  console.log(JSON.stringify(results, null, 2));
}

uploadAll().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
