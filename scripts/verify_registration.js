
// Verification script for Organization Registration
// Uses native fetch (Node.js 18+)

async function testRegistration() {
    const testData = {
        name: `Professional Corp ${Date.now()}`,
        industry: 'Tech',
        size: '10-50',
        country: 'US',
        adminName: 'Pro User',
        adminEmail: `pro.user.${Date.now()}@example.com`,
        password: 'securePassword123!',
        adminRole: 'CEO',
        services: ['AI Integration'],
        // profile: {} // Intentionally omitted
    };

    console.log('Sending registration request to http://localhost:5000/api/organizations...');

    try {
        const response = await fetch('http://localhost:5000/api/organizations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Registration Successful!');
            console.log('Status:', response.status);
            console.log('User ID:', data.user._id);
            console.log('Org ID:', data.organization._id);

            if (data.organization.profile) {
                console.error('\n❌ ERROR: Organization response contains "profile" field!');
                process.exit(1);
            } else {
                console.log('\n✅ Verification: "profile" field correctly absent from Organization.');
            }
        } else {
            console.error('\n❌ Registration Failed:', data.error || data);
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Network or Parsing Error:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
        process.exit(1);
    }
}

testRegistration();
