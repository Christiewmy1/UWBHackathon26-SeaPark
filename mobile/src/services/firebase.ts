import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_C1XUu7Lj9Fn7QkBtuH5a96CNFdRI0oA",
  authDomain: "seapark-29f93.firebaseapp.com",
  projectId: "seapark-29f93",
  storageBucket: "seapark-29f93.firebasestorage.app",
  messagingSenderId: "420912282530",
  appId: "1:420912282530:web:1f8abdb1a4efa15f16d0fb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);