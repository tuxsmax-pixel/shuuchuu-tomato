import React from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "../firebase";
import { useAuth } from "../contexts/AuthContext"; // ← AuthContext を使う！

const LoginButton: React.FC = () => {
  const { user, loading } = useAuth(); // ✅ グローバルなログイン状態を取得
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ ログイン成功:", result.user);
      // 🔁 状態更新は AuthContext 側が担当しているのでここでは何もしない
    } catch (error) {
      console.error("❌ ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("🚪 ログアウト完了");
    } catch (error) {
      console.error("❌ ログアウトエラー:", error);
    }
  };

  // ✅ 状態に応じた表示
  if (loading) {
    return <span className="text-sm text-gray-400">読み込み中...</span>;
  }

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






