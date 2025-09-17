import React from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const LoginButton: React.FC = () => {
  const { user, loading } = useAuth();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("❌ ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("❌ ログアウトエラー:", error);
    }
  };

  if (loading) return <span className="text-sm text-gray-400">読み込み中...</span>;

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





