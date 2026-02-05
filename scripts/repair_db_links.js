import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cortexa1';

async function repairDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        // 1. Find the primary user (the one the user is likely trying to use)
        const primaryUser = await db.collection('users').findOne({ email: 'krishpatel123451@gmail.com' });

        if (!primaryUser) {
            console.error('Primary user not found. Please register a user first.');
            return;
        }

        console.log(`Using primary user: ${primaryUser.email} (${primaryUser._id})`);

        // 2. Fix Organizations
        const orgs = await db.collection('organizations').find({}).toArray();
        for (const org of orgs) {
            const ownerExists = await db.collection('users').findOne({ _id: org.ownerId });
            if (!ownerExists) {
                console.log(`Fixing organization "${org.name}": Re-assigning owner from ${org.ownerId} to ${primaryUser._id}`);
                await db.collection('organizations').updateOne(
                    { _id: org._id },
                    {
                        $set: {
                            ownerId: primaryUser._id,
                            'members.0.userId': primaryUser._id // Also update first member (usually owner)
                        }
                    }
                );
            }
        }

        // 3. Fix Projects
        const projects = await db.collection('projects').find({}).toArray();
        for (const p of projects) {
            const creatorExists = await db.collection('users').findOne({ _id: p.createdBy });
            if (!creatorExists) {
                console.log(`Fixing project "${p.projectName}": Re-assigning creator from ${p.createdBy} to ${primaryUser._id}`);
                await db.collection('projects').updateOne(
                    { _id: p._id },
                    { $set: { createdBy: primaryUser._id, orgId: orgs[0]?._id } } // Assign to first org if needed
                );
            }
        }

        console.log('Repair completed successfully.');
    } catch (error) {
        console.error('Repair failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

repairDatabase();
