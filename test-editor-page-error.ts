/**
 * Test script to debug the /editor/12-cartas page error
 */

async function testEditorPageAPIs() {
  const baseUrl = 'http://localhost:3000';

  console.log('🧪 Testing /editor/12-cartas page APIs...\n');

  try {
    // Test 1: Create a new collection
    console.log('1️⃣ Testing POST /api/card-collections/create...');
    const createResponse = await fetch(`${baseUrl}/api/card-collections/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientName: 'Test Recipient',
        senderName: 'Test Sender',
        contactEmail: 'test@example.com',
      }),
    });

    console.log('Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (!createResponse.ok) {
      console.error('❌ Failed to create collection');
      console.error('Error:', createData);
      return;
    }

    console.log('✅ Collection created successfully');
    console.log('Collection ID:', createData.collection.id);
    console.log('Number of cards:', createData.cards.length);

    const collectionId = createData.collection.id;

    // Test 2: Fetch the collection
    console.log('\n2️⃣ Testing GET /api/card-collections/[id]...');
    const fetchResponse = await fetch(`${baseUrl}/api/card-collections/${collectionId}`);
    
    console.log('Status:', fetchResponse.status);
    const fetchData = await fetchResponse.json();
    console.log('Response:', JSON.stringify(fetchData, null, 2));

    if (!fetchResponse.ok) {
      console.error('❌ Failed to fetch collection');
      console.error('Error:', fetchData);
      return;
    }

    console.log('✅ Collection fetched successfully');

    // Test 3: Update a card
    console.log('\n3️⃣ Testing PATCH /api/cards/[id]...');
    const firstCard = createData.cards[0];
    const updateResponse = await fetch(`${baseUrl}/api/cards/${firstCard.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Title',
        messageText: 'Updated message text',
      }),
    });

    console.log('Status:', updateResponse.status);
    const updateData = await updateResponse.json();
    console.log('Response:', JSON.stringify(updateData, null, 2));

    if (!updateResponse.ok) {
      console.error('❌ Failed to update card');
      console.error('Error:', updateData);
      return;
    }

    console.log('✅ Card updated successfully');

    console.log('\n✅ All API tests passed!');
    console.log('\n📝 Summary:');
    console.log('- Collection creation: ✅');
    console.log('- Collection fetching: ✅');
    console.log('- Card updating: ✅');
    console.log('\nThe APIs are working correctly. The error might be in the frontend code.');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the test
testEditorPageAPIs().catch(console.error);
