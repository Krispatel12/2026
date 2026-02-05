import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cortexa1';

async function verifyIntegrity() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;

        const orgs = await db.collection('organizations').find({}).toArray();
        console.log(`Found ${orgs.length} organizations.`);

        for (const org of orgs) {
            const user = await db.collection('users').findOne({ _id: org.ownerId });
            if (!user) {
                console.warn(`[INTEGRITY ERROR] Organization "${org.name}" (${org._id}) has ownerId ${org.ownerId} but no matching User record found!`);

                // Check if it has members that are Users
                const memberIds = org.members.map(m => m.userId);
                const users = await db.collection('users').find({ _id: { $in: memberIds } }).toArray();
                console.log(`  Members Found in Users Table: ${users.length} / ${org.members.length}`);
                users.forEach(u => console.log(`    - ${u.email} (${u.name})`));
            } else {
                console.log(`[OK] Organization "${org.name}" owner: ${user.email}`);
            }
        }

        const projects = await db.collection('projects').find({}).toArray();
        console.log(`\nFound ${projects.length} projects.`);
        for (const p of projects) {
            const user = await db.collection('users').findOne({ _id: p.createdBy });
            if (!user) {
                console.warn(`[INTEGRITY ERROR] Project "${p.projectName}" (${p._id}) has createdBy ${p.createdBy} but no matching User record found!`);
            } else {
                console.log(`[OK] Project "${p.projectName}" creator: ${user.email}`);
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

verifyIntegrity();
