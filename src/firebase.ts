import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
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

export default db;
