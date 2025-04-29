// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDrIazwAWgygeomrpn3aSC5JLcdIWvlDx8",
  authDomain: "fitpluschat.firebaseapp.com",
  projectId: "fitpluschat",
  storageBucket: "fitpluschat.appspot.com",
  messagingSenderId: "956244466846",
  appId: "1:956244466846:web:e2251a8b985b31889aef8f",
  databaseURL: "https://fitpluschat-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
