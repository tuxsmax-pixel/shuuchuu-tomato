import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getRedirectResult,
  User
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    console.log("🟡 useEffect 発火");

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("✅ getRedirectResult 成功:", result.user);
          setUser(result.user);

          // ✅ スマホ対応：再読み込みでログイン状態を安定化
          window.location.reload();
        } else {
          console.log("🔵 getRedirectResult: ユーザーなし");
          // ✅ ユーザーがいなかった場合でも loading 終了
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("❌ getRedirectResult エラー:", error);
        setLoading(false); // ✅ エラーでも loading を false に
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👀 onAuthStateChanged:", u);
      setUser(u);
      setLoading(false);
    });

    // ✅ タイムアウト保険（10秒後に強制的に loading 終了）
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⏱ 強制的に loading 終了（onAuthStateChanged 反応なし）");
        setLoading(false);
      }
    }, 10000); // 10秒

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
