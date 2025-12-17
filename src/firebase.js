import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEyxj8q1dLOFwdmOzubB1gOW-TXKEyteY",
  authDomain: "reservation-system-15220.firebaseapp.com",
  projectId: "reservation-system-15220",
  storageBucket: "reservation-system-15220.appspot.com",
  messagingSenderId: "877763384644",
  appId: "1:877763384644:web:e379e470decea2421db311",
  measurementId: "G-KYFHQMDNSB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
