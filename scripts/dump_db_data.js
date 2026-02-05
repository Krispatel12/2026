import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cortexa1';

async function listData() {
    let output = '';
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        output += '--- ALL USERS ---\n';
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => {
            output += `User: ${u.email} | ID: ${u._id} | Name: ${u.name}\n`;
        });

        output += '\n--- ALL ORGANIZATIONS ---\n';
        const orgs = await db.collection('organizations').find({}).toArray();
        orgs.forEach(o => {
            output += `Org: ${o.name} | OwnerID: ${o.ownerId} | Slug: ${o.slug}\n`;
        });

        output += '\n--- ALL PROJECTS ---\n';
        const projects = await db.collection('projects').find({}).toArray();
        projects.forEach(p => {
            output += `Project: ${p.projectName} | CreatedBy: ${p.createdBy}\n`;
        });

        fs.writeFileSync(path.join(__dirname, 'db_dump.txt'), output);
        console.log('Data dumped to db_dump.txt');

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

listData();
