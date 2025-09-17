import React from "react";
import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-black font-bold"
      : "text-gray-500 hover:text-black";

  return (
    <header className="bg-white border-b shadow-sm py-3 px-4 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-2 sm:gap-y-0">
        {/* ロゴ */}
        <h1 className="text-lg font-bold text-red-500 text-center sm:text-left">
          🍅 集中トマト
        </h1>

        {/* ナビゲーションメニュー */}
        <nav className="flex flex-col sm:flex-row items-center sm:space-x-4 text-sm gap-y-1 sm:gap-y-0 text-center sm:text-left">
          <Link to="/" className={isActive("/")}>ホーム</Link>
          <Link to="/records" className={isActive("/records")}>記録</Link>
          <Link to="/settings" className={isActive("/settings")}>設定</Link>

          {/* 🔽 追加メニュー 🔽 */}
          <a
            href="mailto:fieldsekkei@gmail.com?subject=集中トマト 不具合報告&body=不具合の内容をできるだけ詳しくご記入ください。"
            className="text-gray-500 hover:text-black"
          >
            不具合報告
          </a>

          <a
            href="https://www.field-sekkei.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-black"
          >
            開発者ページ
          </a>
          {/* 🔼 追加メニューここまで 🔼 */}

          <LoginButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;




