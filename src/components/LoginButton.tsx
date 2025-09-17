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
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    // 🔄 ログイン状態の監視
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👀 onAuthStateChanged:", u);
      setUser(u);
      setLoading(false);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [auth]);

  // ✅ Googleログイン（Popup版）
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ ログイン成功:", result.user);
      setUser(result.user); // 状態更新（すぐ反映）
    } catch (error) {
      console.error("❌ ログインエラー:", error);
    }
  };

  // ✅ ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("🚪 ログアウト完了");
      setUser(null);
    } catch (error) {
      console.error("❌ ログアウトエラー:", error);
    }
  };

  // ✅ 表示切り替え
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





