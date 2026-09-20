import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBMzOFm3som1_g5YWbNqQIoRdWl9uITejg",
  authDomain: "table18-cookingtogether.firebaseapp.com",
  databaseURL:
    "https://table18-cookingtogether-default-rtdb.firebaseio.com",
  projectId: "table18-cookingtogether",
  storageBucket: "table18-cookingtogether.firebasestorage.app",
  messagingSenderId: "193695339847",
  appId: "1:193695339847:web:bdce4710766ed9d69da862",
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);

export default app;