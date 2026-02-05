
// Verification script for Organization AND Project Registration
// Uses native fetch (Node.js 18+)

async function testFullFlow() {
    const timestamp = Date.now();
    const adminEmail = `pro.user.${timestamp}@example.com`;
    const password = 'securePassword123!';

    // 1. Organization Registration Data
    const orgData = {
        name: `Professional Corp ${timestamp}`,
        industry: 'Tech',
        size: '10-50',
        country: 'US',
        adminName: 'Pro User',
        adminEmail: adminEmail,
        password: password,
        adminRole: 'CEO',
        services: ['AI Integration'],
        // profile: {} // Should be ignored/absent
    };

    console.log('--- Step 1: Organization Registration ---');
    let authToken = '';
    let orgId = '';

    try {
        const orgRes = await fetch('http://localhost:5000/api/organizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orgData)
        });

        const orgResult = await orgRes.json();

        if (orgRes.ok) {
            console.log('✅ Org Created');
            console.log('Org ID:', orgResult.organization._id);
            authToken = orgResult.token;
            orgId = orgResult.organization._id;

            if (orgResult.organization.profile) {
                console.error('❌ ERROR: Organization has "profile" field!');
                process.exit(1);
            }
        } else {
            console.error('❌ Org Registration Failed:', orgResult);
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ Network Error (Org):', err.message);
        process.exit(1);
    }

    // 2. Project Registration Data (With Profile)
    const projectData = {
        name: `Alpha Project ${timestamp}`,
        description: 'New AI Initiative',
        orgId: orgId,
        companyProfile: { // This maps to 'profile' in Project model
            goals: 'Market Domination',
            risks: ['Competitors'],
            structure: 'Matrix',
            aiMode: 'Autonomous',
            squads: [{ name: 'Alpha Squad', targetDate: '2026-12-31' }],
            tools: { projects: true, tasks: true, analytics: true, billing: false },
            industry: 'FinTech', // Overrides/Augments
            services: ['Trading Bot']
        },
        invites: []
    };

    console.log('\n--- Step 2: Project Creation ---');
    try {
        const projRes = await fetch('http://localhost:5000/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` // Use token from step 1
            },
            body: JSON.stringify(projectData)
        });

        const projResult = await projRes.json();

        if (projRes.ok) {
            console.log('✅ Project Created');
            console.log('Project ID:', projResult.project._id);

            // Verify Data Separation
            const project = projResult.project;
            if (project.profile && project.profile.goals === 'Market Domination') {
                console.log('✅ Verification: Project contains "profile" data (Strategic Alignment) as requested.');
            } else {
                console.error('❌ ERROR: Project missing "profile" data!');
            }

            if (project.orgId === orgId) {
                console.log('✅ Verification: Project linked to Organization.');
            }

        } else {
            console.error('❌ Project Creation Failed:', projResult);
        }

    } catch (err) {
        console.error('❌ Network Error (Project):', err.message);
    }

    // 3. Verify Tenancy Context Loading (Strict Data Separation)
    console.log('\n--- Step 3: Verify Context Loading (Strict Separation) ---');
    try {
        // Test Organization Context
        const orgContextRes = await fetch(`http://localhost:5000/api/tenancy/context/organization/${orgId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const orgContext = await orgContextRes.json();

        if (orgContext.success && orgContext.context && orgContext.context._id === orgId) {
            console.log('✅ Organization Context Loaded (from Organization table)');
        } else {
            console.error('❌ Failed to load Organization Context:', orgContext);
        }

        // Test Project Context
        const project = (await fetch(`http://localhost:5000/api/projects/${orgId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        }).then(r => r.json())).projects[0];

        if (project) {
            const projContextRes = await fetch(`http://localhost:5000/api/tenancy/context/project/${project._id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const projContext = await projContextRes.json();

            if (projContext.success && projContext.context.project._id === project._id) {
                console.log('✅ Project Context Loaded (from Project table)');
            } else {
                console.error('❌ Failed to load Project Context:', projContext);
            }
        }

    } catch (err) {
        console.error('❌ Network Error (Context):', err.message);
    }
}

testFullFlow();
