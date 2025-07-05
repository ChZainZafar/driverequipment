import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Replace with your Firebase config from mobile app
  apiKey: "AIzaSyBiCwNPNN7w4DJQ9iFUO5YpvKZQP9d706Q",
  authDomain: "study-abroad-admin.firebaseapp.com",
  projectId: "study-abroad-admin",
  storageBucket: "study-abroad-admin.firebasestorage.app",
  messagingSenderId: "724462532880",
  appId: "1:724462532880:web:a1a534dd37554effd30d95",
  measurementId: "G-G8HVY6FR4V",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
