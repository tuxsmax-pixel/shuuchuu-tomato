import React from "react";
import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? "text-black font-bold" : "text-gray-500";

  return (
    <header className="w-full border-b border-gray-300 bg-white px-4 py-3 shadow-sm">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <div className="text-lg font-semibold text-black">集中トマト 🍅</div>
        <nav className="space-x-4 text-sm flex items-center">
          <Link to="/" className={isActive("/")}>
            ホーム
          </Link>
          <Link to="/records" className={isActive("/records")}>
            記録
          </Link>
          <Link to="/settings" className={isActive("/settings")}>
            設定
          </Link>
          {/* ← 設定の右側にログインボタン配置 */}
          <LoginButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;

