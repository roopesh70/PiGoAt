// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "pigoat",
  appId: "1:270047451922:web:36e8763f5733ae40fdf1cb",
  storageBucket: "pigoat.firebasestorage.app",
  apiKey: "AIzaSyABm2mRcrS5YirhT7cuqS3xXscqynIxQT8",
  authDomain: "pigoat.firebaseapp.com",
  measurementId: "G-319CSQP7XB",
  messagingSenderId: "270047451922"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
