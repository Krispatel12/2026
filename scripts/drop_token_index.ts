
import mongoose from 'mongoose';
import { connectDB } from '../server/db/connection';

const fixIndexes = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected.');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection('invites');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        const tokenIndex = indexes.find(idx => idx.name === 'token_1');
        if (tokenIndex) {
            console.log('Found token_1 index. Dropping...');
            await collection.dropIndex('token_1');
            console.log('Dropped token_1 index.');
        } else {
            console.log('token_1 index not found.');
        }

        // Check for other potential issues (e.g., pending invites with null tokens if we were to re-add it)
        // unique: true on token means nulls conflict.

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndexes();
