const mongoose = require('mongoose');

// Configuration
const MONGO_URI = 'mongodb://localhost:27017/cortexa'; // Hardcoded based on config or env
const ALLOWED_COLLECTIONS = new Set([
    'users',
    'changelog', // Keep migration history just in case
    'changelog_lock'
]);

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;

        // Get all collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('Current collections:', collectionNames);

        // Identify collections to remove
        const toRemove = collectionNames.filter(name => !ALLOWED_COLLECTIONS.has(name));

        if (toRemove.length === 0) {
            console.log('No collections to remove. Database is clean.');
        } else {
            console.log('Removing the following collections:', toRemove);

            for (const name of toRemove) {
                try {
                    await db.collection(name).drop();
                    console.log(`Dropped collection: ${name}`);
                } catch (err) {
                    console.error(`Failed to drop collection ${name}:`, err.message);
                }
            }
        }

        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
}

cleanup();
