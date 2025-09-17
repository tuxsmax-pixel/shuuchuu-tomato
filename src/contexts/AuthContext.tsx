import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  User
} from "firebase/auth";
import { app } from "../firebase";

// 型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Contextの作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// どこでも使えるように
export const useAuth = () => useContext(AuthContext);

// プロバイダーの定義
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    // 🔁 リダイレクト後にログインユーザーを取得
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("✅ getRedirectResult 成功:", result.user);
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("❌ getRedirectResult エラー:", error);
      });

    // 👀 ログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👀 onAuthStateChanged:", u);
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

