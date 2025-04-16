// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA85nPI4auS1ugrqPBws8IHJuh5_lbaFhU",
  authDomain: "marvelverse-3346f.firebaseapp.com",
  projectId: "marvelverse-3346f",
  storageBucket: "marvelverse-3346f.firebasestorage.app",
  messagingSenderId: "759912928483",
  appId: "1:759912928483:web:253bcb0736d84ef706a1d6",
  measurementId: "G-CMQ3C6CMBC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
if (typeof window !== "undefined") {
  getAnalytics(app);
}