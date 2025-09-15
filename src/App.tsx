// src/App.tsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import RecordsPage from "./pages/RecordsPage"; // ← 追加

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white font-rounded">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/records" element={<RecordsPage />} /> {/* ← 追加 */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;