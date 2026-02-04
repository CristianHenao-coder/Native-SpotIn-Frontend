
async function testLogin() {
  try {
    const response = await fetch('https://spot-in-backend-a36a.vercel.app/api/admin-web/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elmejor@gmail.com', password: '123456' })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (response.headers.get('set-cookie')) {
      console.log('Cookie received');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
testLogin();
