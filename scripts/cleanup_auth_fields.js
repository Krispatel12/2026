import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cortexa1';

async function runMigration() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;

        // Cleanup Organizations
        console.log('Cleaning up Organization collection...');
        const orgResult = await db.collection('organizations').updateMany(
            {},
            {
                $unset: {
                    adminEmail: "",
                    adminPasswordHash: ""
                }
            }
        );
        console.log(`Updated ${orgResult.modifiedCount} organizations.`);

        // Cleanup Projects
        console.log('Cleaning up Project collection...');
        const projectResult = await db.collection('projects').updateMany(
            {},
            {
                $unset: {
                    projectEmail: "",
                    projectPasswordHash: ""
                }
            }
        );
        console.log(`Updated ${projectResult.modifiedCount} projects.`);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runMigration();
