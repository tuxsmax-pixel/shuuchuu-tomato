import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

// 通知音選択肢（拡張子付きファイル名も指定）
const soundOptions = [
  { value: "bell", label: "🔔 ベル", file: "bell.mp3" },
  { value: "chime", label: "🎶 チャイム", file: "chime.mp3" },
  { value: "piano", label: "🎹 ピアノ", file: "piano.mp3" },
  { value: "bird", label: "🐦 小鳥のさえずり", file: "bird.mp3" },
  { value: "water-flow", label: "💧 水のせせらぎ", file: "water-flow.mp3" },
  { value: "drum", label: "🥁 ドラム", file: "drum.mp3" },
  { value: "Notify", label: "🛎️ 通知ベル (WAV)", file: "Notify.wav" },
];

const SettingsPage: React.FC = () => {
  const [, setSelectedSound] = useState("bell");
  const [tempSound, setTempSound] = useState("bell");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // 初期値読み込み（localStorage）
  useEffect(() => {
    const saved = localStorage.getItem("notificationSound");
    if (saved) {
      setSelectedSound(saved);
      setTempSound(saved);
    }
  }, []);

  // プレビュー再生（音を切り替える）
  const handlePreview = (soundValue: string) => {
    const file = soundOptions.find((s) => s.value === soundValue)?.file;
    if (!file) return;

    // すでに再生中の音を止める
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    const audio = new Audio(`/sounds/${file}`);
    audio.volume = 0.6;
    audio.play();
    setPreviewAudio(audio);
  };

  // セレクト変更時
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sound = e.target.value;
    setTempSound(sound);
    handlePreview(sound);
  };

  // OKボタン → 選択を確定＆保存＆再生停止
  const handleConfirm = () => {
    setSelectedSound(tempSound);
    localStorage.setItem("notificationSound", tempSound);

    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    alert("通知音が設定されました！");
  };

  // 🔁 バックアップをダウンロードする処理
  const handleBackup = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const notificationSound = localStorage.getItem("notificationSound") || "bell";

    const data = {
      tasks,
      notificationSound,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shuchu-tomato-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 🔓 ログアウト処理
  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      alert("ログアウトしました！");
      window.location.href = "/"; // ホームに戻す
    } catch (error) {
      console.error("❌ ログアウト失敗:", error);
      alert("ログアウトに失敗しました");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      {/* 通知音セレクト */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          通知音を選択：
        </label>
        <select
          value={tempSound}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {soundOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          選択するとすぐにプレビューが再生されます。
        </p>

        <button
          onClick={handleConfirm}
          className="mt-4 px-4 py-2 bg-black text-white rounded text-sm font-semibold active:scale-95"
        >
          OK
        </button>
      </div>

      {/* バックアップダウンロード機能 */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-3">データのバックアップ</h2>
        <p className="text-sm text-gray-600 mb-2">
          現在のタスクと通知音設定をファイルとして保存できます。
        </p>
        <button
          onClick={handleBackup}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold active:scale-95"
        >
          バックアップをダウンロード
        </button>
      </div>

      {/* 復元セクション */}
      <div className="mt-12">
        <h2 className="text-lg font-bold mb-3">データの復元</h2>
        <p className="text-sm text-gray-600 mb-2">
          バックアップファイル（.json）を選択して復元します。
        </p>

        <input
          type="file"
          accept=".json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              const text = await file.text();
              const json = JSON.parse(text);

              // tasksがあるなら保存
              if (json.tasks) {
                localStorage.setItem("tasks", JSON.stringify(json.tasks));
              }

              // 通知音があるなら保存
              if (json.notificationSound) {
                localStorage.setItem("notificationSound", json.notificationSound);
              }

              alert("復元が完了しました！ページをリロードします。");
              window.location.reload();
            } catch (err) {
              alert("復元に失敗しました。正しいバックアップファイルを選んでください。");
              console.error(err);
            }
          }}
          className="block mt-2"
        />
      </div>

      {/* ログアウトセクション */}
      <div className="mt-12 border-t pt-6">
        <h2 className="text-lg font-bold mb-3">アカウント</h2>
        <p className="text-sm text-gray-600 mb-2">
          現在のGoogleアカウントをログアウトできます。
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded text-sm font-semibold active:scale-95"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
