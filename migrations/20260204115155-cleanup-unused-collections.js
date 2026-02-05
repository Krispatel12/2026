export const up = async (db, client) => {
    // 1. Define the allowed collections (based on Mongoose models)
    const allowedCollections = new Set([
        'users',
        'changelog',
        'changelog_lock'
    ]);

    // 2. Get all current collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('Current collections:', collectionNames);

    // 3. Find collections to remove
    const toRemove = collectionNames.filter(name => !allowedCollections.has(name));

    if (toRemove.length === 0) {
        console.log('No collections to remove. Database is clean.');
        return;
    }

    console.log('Removing the following collections:', toRemove);

    // 4. Drop the unused collections
    for (const name of toRemove) {
        try {
            await db.collection(name).drop();
            console.log(`Dropped collection: ${name}`);
        } catch (err) {
            console.error(`Failed to drop collection ${name}:`, err);
        }
    }
};

export const down = async (db, client) => {
    // Down migration is tricky as we can't easily restore dropped data without a backup.
    // We'll log that this is irreversible.
    console.warn('The cleanup migration is irreversible. Dropped collections cannot be restored by this script.');
};
