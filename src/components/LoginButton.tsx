// src/components/LoginButton.tsx
import React, { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "../firebase";

const LoginButton: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // 🔁 リダイレクト後にユーザー情報を取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u);
      setUser(u);
    });

    // リダイレクト結果を取得（1回のみ）
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login (redirect) success:", result.user);
        }
      })
      .catch((error) => {
        console.error("リダイレクトログインエラー:", error);
      });

    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
      // ↓ リダイレクトされるのでこの後のコードは実行されない
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out");
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




