import {initializeApp} from "firebase/app";
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore";
import {getAuth, connectAuthEmulator} from "firebase/auth";
import {getStorage, connectStorageEmulator} from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

export const firebaseVapidKey = process.env.FIREBASE_VAPID_KEY;

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);
export const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099");
export const storage = getStorage(app);
connectStorageEmulator(storage, "127.0.0.1", 9199);
export const messaging = getMessaging(app);