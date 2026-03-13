require('dotenv').config({ path: '.env.local' });

const { MercadoPagoConfig, Preference } = require('mercadopago');

async function test() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');
    
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'message',
            title: 'Paper Bloom Digital - Mensagem Personalizada',
            description: 'Presente digital personalizado',
            quantity: 1,
            unit_price: 19.90,
            currency_id: 'BRL',
          },
        ],
        metadata: {
          productType: 'message',
          messageId: 'test-123',
        },
        statement_descriptor: 'PAPERBLOOM',
      },
    });

    console.log('✅ Preference created successfully!');
    console.log('ID:', result.id);
    console.log('URL:', result.init_point);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

test();
