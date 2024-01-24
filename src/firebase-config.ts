// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 
};
const firebaseApp = initializeApp(firebaseConfig);

//이미지 업로드위해
const firestore = getFirestore(firebaseApp);
const storageApp = getStorage(firebaseApp);

const appAuth = getAuth(firebaseApp);

export { appAuth, firestore, storageApp, firebaseApp };
