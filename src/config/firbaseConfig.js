
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDr-vWQDmyAyUnkXrosDrfzBJB2na2WUCM",
    authDomain: "todo-ee566.firebaseapp.com",
    projectId: "todo-ee566",
    storageBucket: "todo-ee566.appspot.com",
    messagingSenderId: "316682104834",
    appId: "1:316682104834:web:300143c81c7aaee57b771b"
};

const app = initializeApp(firebaseConfig);
export const imageDb = getStorage(app);