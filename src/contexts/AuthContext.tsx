import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  User
} from "firebase/auth";
import { app } from "../firebase";

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
  const auth = getAuth(app);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("✅ getRedirectResult 成功:", result.user);
          setUser(result.user);
          window.location.reload(); // 🔁 これがスマホ対応のキモ！
        } else {
          console.log("🔵 getRedirectResult: ユーザーなし");
        }
      })
      .catch((error) => {
        console.error("❌ getRedirectResult エラー:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👀 onAuthStateChanged:", u);
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


