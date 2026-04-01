import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkZGZfrdC-at2c3HDVCg_qqMZhtei2oXo",
  authDomain: "test-28-mar.firebaseapp.com",
  projectId: "test-28-mar",
  storageBucket: "test-28-mar.firebasestorage.app",
  messagingSenderId: "956303936022",
  appId: "1:956303936022:web:a0150702f258d9eb58c337"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);


export { app, db, storage };