// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDkTI5kQLeCvjJRUsheEpuFfPo7DGJIO3g",
    authDomain: "new-context-board.firebaseapp.com",
    databaseURL: "https://new-context-board-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "new-context-board",
    storageBucket: "new-context-board.appspot.com",
    messagingSenderId: "547186713031",
    appId: "1:547186713031:web:5327bacbaab724deab39e2",
    measurementId: "G-0LVEBFMD6M"
  };
const firebaseApp = initializeApp(firebaseConfig);

//이미지 업로드위해
const firestore = getFirestore(firebaseApp);
const storageApp = getStorage(firebaseApp);

const appAuth = getAuth(firebaseApp);

export { appAuth, firestore, storageApp, firebaseApp };
