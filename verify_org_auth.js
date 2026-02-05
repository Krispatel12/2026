const API_URL = 'http://localhost:5000/api';

async function verifyOrgRegistration() {
    console.log('--- STARTING ORGANIZATION REGISTRATION VERIFICATION (ESM) ---');

    const registrationPayload = {
        name: "Acme Elite Corp " + Date.now(),
        industry: "Deep Learning Research",
        size: "51-200",
        country: "India",
        adminName: "Senior Architect",
        adminEmail: `architect_${Date.now()}@acme.ai`,
        password: "ElitePassword123!",
        adminRole: "Chief Strategist",
        coords: { lat: 12.9716, lng: 77.5946 },
        services: ["AI/ML Development", "Network Operations"],
        profile: {
            goals: "Establish neural hegemony",
            risks: ["Data leakage", "Quantum decryption"],
            timeline: { start: "2026-01-01", end: "2027-01-01", type: "separated" },
            structure: "multi",
            aiMode: "auto",
            squads: [{ name: "Alpha Research", targetDate: "2026-06-01" }],
            tools: { projects: true, tasks: true, analytics: true, billing: false },
            invites: [{ email: "specialist@acme.ai", role: "Researcher", skills: ["Python", "PyTorch"] }]
        }
    };

    try {
        console.log('Step 1: Registering Elite Organization...');
        const regRes = await fetch(`${API_URL}/organizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationPayload)
        });

        const regData = await regRes.json();
        console.log('Response Status:', regRes.status);

        if (!regRes.ok) {
            console.error('Registration Failed:', JSON.stringify(regData, null, 2));
            process.exit(1);
        }

        console.log('✅ Registration Successful');
        const token = regData.token;
        const orgId = regData.organization._id;

        console.log('\nStep 2: Fetching Organization Context...');
        const contextRes = await fetch(`${API_URL}/tenancy/context/organization/${orgId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const contextData = await contextRes.json();
        console.log('Context Status:', contextRes.status);

        if (!contextRes.ok) {
            console.error('Context Fetch Failed:', JSON.stringify(contextData, null, 2));
            process.exit(1);
        }

        // The TenancyController returns { success: true, context: { ...orgData } }
        const org = contextData.context;
        console.log('Verifying data persistence...');

        if (!org) throw new Error('Context object is empty');
        if (!org.profile) throw new Error('profile data missing in organization record');

        const assertions = [
            { cond: org.adminEmail === registrationPayload.adminEmail, msg: 'adminEmail mismatch' },
            { cond: org.profile.goals === registrationPayload.profile.goals, msg: 'profile goals mismatch' },
            { cond: org.profile.aiMode === registrationPayload.profile.aiMode, msg: 'profile aiMode mismatch' },
            { cond: org.profile.tools.billing === false, msg: 'profile tools mismatch' }
        ];

        assertions.forEach(a => {
            if (!a.cond) throw new Error(a.msg);
        });

        console.log('✅ SUCCESS: All Elite profile data persisted strictly in Organization table.');

    } catch (error) {
        console.error('❌ VERIFICATION ERROR:', error.message);
        process.exit(1);
    }
}

verifyOrgRegistration();
