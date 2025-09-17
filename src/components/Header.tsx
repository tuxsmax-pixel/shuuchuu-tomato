import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";

const Header = () => {
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // アクティブなリンクに太字を適用
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

        {/* ✅ PC版メニュー */}
        <nav className="hidden sm:flex items-center space-x-4 text-sm">
          <Link to="/" className={isActive("/")}>ホーム</Link>
          <Link to="/records" className={isActive("/records")}>記録</Link>
          <Link to="/settings" className={isActive("/settings")}>設定</Link>
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
          <LoginButton />
        </nav>

        {/* ✅ スマホ版メニュー */}
        <div className="flex flex-col sm:hidden items-center gap-y-1 text-sm">
          <div className="flex gap-x-4">
            <Link to="/" className={isActive("/")}>ホーム</Link>
            <Link to="/records" className={isActive("/records")}>記録</Link>

            {/* 設定ドロップダウンボタン */}
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="text-gray-500 hover:text-black"
            >
              設定 {isDropdownOpen ? "▲" : "▼"}
            </button>
          </div>

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div className="flex flex-col items-center gap-y-1 mt-1">
              <Link to="/settings" className={isActive("/settings")}>設定ページ</Link>
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
              <LoginButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;





