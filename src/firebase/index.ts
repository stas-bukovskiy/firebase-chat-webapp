import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAboaS9NaoGCUsbuZOP34dcuSLh77pZsvc",
    authDomain: "chat-webapp-6634b.firebaseapp.com",
    projectId: "chat-webapp-6634b",
    storageBucket: "chat-webapp-6634b.firebasestorage.app",
    messagingSenderId: "387272261368",
    appId: "1:387272261368:web:9dff73600ca241bc6e450d",
    measurementId: "G-SJHHNCXRGF"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);