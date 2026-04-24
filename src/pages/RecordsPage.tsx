// src/pages/RecordsPage.tsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Records = {
  [date: string]: number;
};

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<Records>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState("");

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Firestoreからデータ取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = collection(db, "users", user.uid, "records");
        const snapshot = await getDocs(ref);

        const data: Records = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data().minutes;
        });
        setRecords(data);

        // 🎯 目標時間を取得
        const settingsRef = doc(db, "users", user.uid, "settings", "config");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const goal = settingsSnap.data().monthlyGoal;
          if (goal) setMonthlyGoal(goal);
        }
      } else {
        setRecords({});
        setMonthlyGoal(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const getTileContent = ({ date }: { date: Date }) => {
    const key = date.toLocaleDateString("sv-SE");
    if (records[key]) {
      return <div className="text-sm text-rose-500 text-center mt-1">🍅</div>;
    }
    return null;
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const prevMonth = new Date(year, month - 1, 1);

  const currentMonthTotal = Object.entries(records).reduce((total, [date, minutes]) => {
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() === month
      ? total + minutes
      : total;
  }, 0);

  const prevMonthTotal = Object.entries(records).reduce((total, [date, minutes]) => {
    const d = new Date(date);
    return d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth()
      ? total + minutes
      : total;
  }, 0);

  const diffPercent =
    prevMonthTotal === 0
      ? null
      : Math.round(((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const key = date.toLocaleDateString("sv-SE");
    return records[key] || 0;
  });

  const monthlyLabels = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    return Object.entries(records).reduce((sum, [date, minutes]) => {
      const d = new Date(date);
      return d.getFullYear() === year && d.getMonth() === i ? sum + minutes : sum;
    }, 0);
  });

  // 🎯 目標保存
  const handleSaveGoal = async () => {
    const user = auth.currentUser;
    if (!user || !goalInput) return;

    const value = parseInt(goalInput);
    if (isNaN(value) || value <= 0) return;

    const ref = doc(db, "users", user.uid, "settings", "config");
    await setDoc(ref, { monthlyGoal: value }, { merge: true });
    setMonthlyGoal(value);
    setGoalInput("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">

      {/* カレンダー */}
      <Calendar
        onClickDay={(value) => setSelectedDate(value)}
        tileContent={getTileContent}
        value={currentMonth}
        onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate || new Date())}
        locale="ja-JP"
        calendarType="gregory"
        className="react-calendar w-full rounded-xl shadow-sm border border-rose-200"
      />

      {/* 選択日 */}
      {selectedDate && (
        <div className="mt-4 text-sm text-gray-800 bg-rose-50 px-3 py-2 rounded-lg shadow-sm border border-rose-200">
          <strong>
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
            {selectedDate.getDate()}日：
          </strong>{" "}
          {records[selectedDate.toLocaleDateString("sv-SE")]
            ? formatMinutes(records[selectedDate.toLocaleDateString("sv-SE")])
            : "記録なし"}
        </div>
      )}

      {/* モード切替 */}
      <div className="flex justify-center gap-2 mb-4 mt-6">
        {["month", "year"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as "month" | "year")}
            className={`px-3 py-1 text-sm font-medium rounded-full border transition ${
              viewMode === mode
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white text-rose-600 border border-rose-300 hover:bg-rose-100"
            }`}
          >
            {mode === "month" ? "月表示" : "年表示"}
          </button>
        ))}
      </div>

      {/* 月切り替え */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="text-rose-600 hover:underline text-sm"
        >
          ◀ 前月
        </button>
        <div className="text-rose-800 font-semibold">
          {year}年{viewMode === "month" && ` ${month + 1}月`}
        </div>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="text-rose-600 hover:underline text-sm"
        >
          翌月 ▶
        </button>
      </div>

      {/* 累計カード */}
      <div className="p-4 rounded-xl shadow-sm border border-rose-300 bg-rose-100 mb-6">
        <h2 className="text-base font-bold text-rose-800 mb-1">📊 累計勉強時間</h2>
        <p className="text-3xl font-extrabold text-rose-700">
          {viewMode === "month"
            ? formatMinutes(currentMonthTotal)
            : formatMinutes(
                Object.entries(records).reduce((total, [date, minutes]) => {
                  const d = new Date(date);
                  return d.getFullYear() === year ? total + minutes : total;
                }, 0)
              )}
        </p>
        {viewMode === "month" && (
          <p className="text-sm mt-2 text-rose-600 font-medium">
            {diffPercent === null
              ? "前月データなし"
              : diffPercent === 0
              ? "前月と同じ"
              : diffPercent > 0
              ? <span className="text-green-600">前月比 +{diffPercent}%</span>
              : <span className="text-red-600">前月比 {diffPercent}%</span>}
          </p>
        )}

        {/* 🎯 月間目標 */}
        {viewMode === "month" && (
          <div className="mt-4 text-sm text-rose-700 space-y-1">
            {monthlyGoal ? (
              <>
                <p>
                  🎯 目標: {formatMinutes(monthlyGoal)}（達成率{" "}
                  <strong>{Math.min(100, Math.round((currentMonthTotal / monthlyGoal) * 100))}%</strong>）
                </p>
                <p>
                  ⏳ 残り:{" "}
                  {formatMinutes(Math.max(0, monthlyGoal - currentMonthTotal))}
                </p>
                <p className="text-xs text-rose-500 mt-3 font-semibold">📝 目標時間を変更する（分で入力）</p>
              </>
            ) : (
              <p className="text-gray-600">目標がまだ設定されていません。</p>
            )}

            <div className="flex mt-2">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="分数で入力（例: 1200）"
                className="flex-1 px-3 py-1 border border-rose-300 rounded-l text-sm"
              />
              <button
                onClick={handleSaveGoal}
                className="bg-rose-500 text-white px-4 py-1 rounded-r text-sm font-semibold hover:bg-rose-600 active:scale-95"
              >
                🍅 保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* グラフ */}
      <div className="mt-2">
        <h2 className="text-md font-bold mb-3 text-rose-700">
          📈 {viewMode === "month" ? "日別グラフ" : "月別グラフ"}（{year}年{viewMode === "month" ? ` ${month + 1}月` : ""}）
        </h2>
        <Bar
          data={{
            labels: viewMode === "month" ? dailyLabels : monthlyLabels,
            datasets: [
              {
                label: "勉強時間（分）",
                data: viewMode === "month" ? dailyData : monthlyData,
                backgroundColor: "rgba(244, 63, 94, 0.6)",
              },
            ],
          }}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 60 },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default RecordsPage;







