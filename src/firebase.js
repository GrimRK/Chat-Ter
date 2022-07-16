import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCmIeLL7RbuAbcIdfEgdDbh1_ve25CEwtg",
  authDomain: "grimrk-chat-app.firebaseapp.com",
  projectId: "grimrk-chat-app",
  storageBucket: "grimrk-chat-app.appspot.com",
  messagingSenderId: "25678842511",
  appId: "1:25678842511:web:cee537205ca2c55307befa",
  measurementId: "G-P4GBBYPC4W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
