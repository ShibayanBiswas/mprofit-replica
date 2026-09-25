// Optional MongoDB persistence. Without MONGODB_URI the API stays in-memory.
import { MongoClient } from 'mongodb';

const ID = 'live';
let col = null;
let dirty = false;
let timer = null;
let snapshotFn = () => null;

export function markDirty() {
  dirty = true;
}

export async function attachStore(snapshot) {
  snapshotFn = snapshot;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[mock-api] MONGODB_URI unset — state stays in memory');
    return null;
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2500 });
  try {
    await client.connect();
  } catch (e) {
    console.error('[mock-api] MongoDB unreachable, continuing in memory:', e.message);
    return null;
  }
  col = client.db(process.env.MONGODB_DB || 'mprofit').collection('app_state');
  const doc = await col.findOne({ _id: ID });
  if (!process.env.VERCEL) {
    timer = setInterval(() => { void flush(); }, 2000);
    timer.unref?.();
    const stop = () => { clearInterval(timer); return flush(); };
    process.once('SIGTERM', () => { void stop().then(() => process.exit(0)); });
  }
  console.log('[mock-api] MongoDB connected');
  return doc?.payload ?? null;
}

export async function flush() {
  if (!col || !dirty) return;
  dirty = false;
  try {
    await col.updateOne({ _id: ID }, { $set: { payload: snapshotFn(), updatedAt: new Date() } }, { upsert: true });
  } catch (e) {
    dirty = true;
    console.error('[mock-api] MongoDB save failed', e.message);
  }
}
