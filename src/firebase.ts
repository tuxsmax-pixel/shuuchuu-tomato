// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// あなたの Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyC7C1vX11mlZxGXld4GS7UqwJofKTXXPYI",
  authDomain: "shuuchuu-tomato-64f4f.firebaseapp.com",
  projectId: "shuuchuu-tomato-64f4f",
  storageBucket: "shuuchuu-tomato-64f4f.firebasestorage.app",
  messagingSenderId: "807536070877",
  appId: "1:807536070877:web:8bb75ab2db4a58ce60cb34",
};

// Firebase アプリの初期化
export const app = initializeApp(firebaseConfig);

// Firestore インスタンスの取得と export
export const db = getFirestore(app);

