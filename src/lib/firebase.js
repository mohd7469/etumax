import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCj5YhAoZ7THB2_aCq9UTB8Fq7QlOFkqwg",
  authDomain: "project-4a63e079-13f8-45c1-834.firebaseapp.com",
  projectId: "project-4a63e079-13f8-45c1-834",
  storageBucket: "project-4a63e079-13f8-45c1-834.firebasestorage.app",
  messagingSenderId: "302761923409",
  appId: "1:302761923409:web:b7872f4dc4ee5b698df970"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);


export { app, db, storage };