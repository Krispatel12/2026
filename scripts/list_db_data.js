import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cortexa1';

async function listData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('--- ALL USERS ---');
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(`User: ${u.email} | ID: ${u._id} | Name: ${u.name}`));

        console.log('\n--- ALL ORGANIZATIONS ---');
        const orgs = await db.collection('organizations').find({}).toArray();
        orgs.forEach(o => console.log(`Org: ${o.name} | OwnerID: ${o.ownerId} | Slug: ${o.slug}`));

        console.log('\n--- ALL PROJECTS ---');
        const projects = await db.collection('projects').find({}).toArray();
        projects.forEach(p => console.log(`Project: ${p.projectName} | CreatedBy: ${p.createdBy}`));

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

listData();
