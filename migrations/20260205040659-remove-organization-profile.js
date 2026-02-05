/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    // Remove the `profile` field from all documents in the `organizations` collection
    await db.collection('organizations').updateMany(
        {},
        { $unset: { profile: "" } }
    );
};

export const down = async (db, client) => {
    // We cannot restore the `profile` data as it's permanently removed.
    console.warn('This migration cannot be reverted as it deletes data.');
};
