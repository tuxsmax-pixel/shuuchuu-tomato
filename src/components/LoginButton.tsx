import React from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const LoginButton: React.FC = () => {
  const { user, loading } = useAuth();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    if (!auth) return;

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("❌ ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("❌ ログアウトエラー:", error);
    }
  };

  if (loading) return <span className="text-sm text-gray-400">読み込み中...</span>;

  if (!auth) return null;

  if (user) {
    return (
      <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-black">
        ログアウト（{user.displayName ?? user.email}）
      </button>
    );
  }

  return (
    <button onClick={handleLogin} className="text-sm text-gray-500 hover:text-black">
      ログイン
    </button>
  );
};

export default LoginButton;





