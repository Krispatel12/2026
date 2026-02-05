/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
module.exports = {
    async up(db, client) {
        // 1. Organization Checks
        // Ensure slug is unique for efficient lookup contexts
        await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });

        // 2. Project Checks
        // Ensure slug is unique per organization (Strict Separation Scope)
        await db.collection('projects').createIndex({ slug: 1, orgId: 1 }, { unique: true });
        // Performance index for fetching all projects by org (Service Layer Requirement)
        await db.collection('projects').createIndex({ orgId: 1 });

        // 3. User Checks
        // Ensure email is unique (Auth System Requirement)
        await db.collection('users').createIndex({ email: 1 }, { unique: true });

        // 4. Invite Checks
        // Quick lookup for invite codes
        await db.collection('invites').createIndex({ code: 1 }, { unique: true });
    },

    async down(db, client) {
        // Rollback indices if needed
        try {
            await db.collection('projects').dropIndex({ slug: 1, orgId: 1 });
            await db.collection('projects').dropIndex({ orgId: 1 });
        } catch (e) { console.log('Index rollback skipped/failed', e); }
    }
};
