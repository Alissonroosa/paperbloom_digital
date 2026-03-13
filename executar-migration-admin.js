/**
 * Script para executar a migration das tabelas admin
 * Execute com: node executar-migration-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migration das tabelas admin...\n');

    // Criar tabela admin_users
    console.log('📦 Criando tabela admin_users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela admin_users criada\n');

    // Criar tabela product_prices
    console.log('📦 Criando tabela product_prices...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(50) NOT NULL UNIQUE,
        product_name VARCHAR(255) NOT NULL,
        price_from_cents INTEGER,
        price_cents INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela product_prices criada\n');

    // Criar tabela price_history
    console.log('📦 Criando tabela price_history...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(50) NOT NULL,
        old_price_cents INTEGER,
        new_price_cents INTEGER NOT NULL,
        old_price_from_cents INTEGER,
        new_price_from_cents INTEGER,
        changed_by UUID REFERENCES admin_users(id),
        reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela price_history criada\n');

    // Criar índices
    console.log('📦 Criando índices...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_product_prices_product_id ON product_prices(product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at DESC)');
    console.log('✅ Índices criados\n');

    // Inserir admin user padrão
    console.log('👤 Criando usuário admin...');
    const passwordHash = await bcrypt.hash('Alice2611', 10);
    await client.query(`
      INSERT INTO admin_users (email, password_hash, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
    `, ['paperbloom.tm@gmail.com', passwordHash, 'Admin']);
    console.log('✅ Usuário admin criado: paperbloom.tm@gmail.com\n');

    // Inserir preços padrão dos produtos
    console.log('💰 Inserindo preços padrão...');
    const products = [
      { id: 'message', name: 'Paper Bloom Digital - Mensagem Personalizada', price: 1990 },
      { id: 'card-collection', name: 'Paper Bloom Digital - 12 Cartas', price: 2990 },
      { id: 'gender-reveal', name: 'Paper Bloom Digital - Revelação Virtual', price: 1990 },
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO product_prices (product_id, product_name, price_cents)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id) DO NOTHING
      `, [product.id, product.name, product.price]);
      console.log(`  ✅ ${product.name}: R$ ${(product.price / 100).toFixed(2)}`);
    }

    console.log('\n🎉 Migration concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('  - Tabela admin_users: criada');
    console.log('  - Tabela product_prices: criada');
    console.log('  - Tabela price_history: criada');
    console.log('  - Usuário admin: paperbloom.tm@gmail.com');
    console.log('\n🔗 Acesse: /admin/login');

  } catch (error) {
    console.error('❌ Erro na migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
