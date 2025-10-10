import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ENTRIES_COLLECTION = 'asset_entries';
const DELETED_COLLECTION = 'deleted_entries';

export async function getAllEntries() {
  const col = collection(db, ENTRIES_COLLECTION);
  const snapshot = await getDocs(col);
  const rows: any[] = [];
  snapshot.forEach(docSnap => {
    rows.push({ id: docSnap.id, ...docSnap.data() });
  });
  return rows;
}

export async function createEntry(entry: any) {
  const ref = doc(db, ENTRIES_COLLECTION, entry.id);
  await setDoc(ref, entry);
}

export async function getDeletedEntries() {
  const col = collection(db, DELETED_COLLECTION);
  const snapshot = await getDocs(col);
  const rows: any[] = [];
  snapshot.forEach(docSnap => {
    rows.push({ id: docSnap.id, ...docSnap.data() });
  });
  return rows;
}

// Move all documents for a given assetId from asset_entries to deleted_entries.
export async function moveAssetToDeleted(assetId: string, meta: { deletedAt?: string; remarks?: string } = {}) {
  // Query entries for the asset
  const col = collection(db, ENTRIES_COLLECTION);
  const q = query(col, where('assetId', '==', assetId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  // Use a batch to write to deleted and delete original docs
  const batch = writeBatch(db);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    const deletedRef = doc(db, DELETED_COLLECTION, id);
    batch.set(deletedRef, { ...data, deletedAt: meta.deletedAt || new Date().toISOString(), deleteRemarks: meta.remarks || null });
    const origRef = doc(db, ENTRIES_COLLECTION, id);
    batch.delete(origRef);
  });

  await batch.commit();
}

export default db;
