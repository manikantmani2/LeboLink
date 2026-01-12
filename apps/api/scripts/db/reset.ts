import mongoose from 'mongoose';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lebolink';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('[reset] connected');

  const collections = await mongoose.connection.db!.listCollections().toArray();
  for (const c of collections) {
    console.log('[reset] dropping', c.name);
    await mongoose.connection.dropCollection(c.name).catch(() => {});
  }

  await mongoose.disconnect();
  console.log('[reset] done');
}

run().catch((e) => { console.error(e); process.exit(1); });
