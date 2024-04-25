import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
import { getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXPud5Rpwm-dH8X4sS9dPwq7OZSrzR-7Q",
  authDomain: "delivery-app-46efa.firebaseapp.com",
  projectId: "delivery-app-46efa",
  storageBucket: "delivery-app-46efa.appspot.com",
  messagingSenderId: "205347620081",
  appId: "1:205347620081:web:b54a9b9a0ac5edd21d1550",
  measurementId: "G-S96RFJ6DLP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
export const storage = getStorage(app);