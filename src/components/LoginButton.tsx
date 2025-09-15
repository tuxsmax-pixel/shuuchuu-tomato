// src/components/LoginButton.tsx
import React, { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "../firebase";

const LoginButton: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u); // ← ログ確認
      setUser(u);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Login success:", result.user); // ← ログ確認
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out"); // ← ログ確認
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-black text-sm"
      >
        ログアウト（{user.displayName ?? user.email ?? "ユーザー"}）
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="text-gray-500 hover:text-black text-sm"
    >
      ログイン
    </button>
  );
};

export default LoginButton;



