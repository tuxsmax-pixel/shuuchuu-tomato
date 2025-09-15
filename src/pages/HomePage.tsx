// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const HomePage: React.FC = () => {
  const STUDY_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(STUDY_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"study" | "break">("study");
  const [statusText, setStatusText] = useState("勉強中");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, text: "英単語", done: false },
    { id: 2, text: "数学", detail: "1ポモドーロ", done: false },
    { id: 3, text: "読書", done: false },
  ]);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [notificationSound, setNotificationSound] = useState("bell");

  const [eventName, setEventName] = useState<string>("共通テスト");
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasEvent, setHasEvent] = useState(false);
  const [showInvalidDateMessage, setShowInvalidDateMessage] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const calcRemainingDays = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const target = new Date(dateStr);
    const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diffDays = Math.ceil((t1 - t0) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };
  const remainingDays = calcRemainingDays(targetDate);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
    const saved = localStorage.getItem("notificationSound");
    if (saved) setNotificationSound(saved);
  }, []);

  useEffect(() => {
    const unregister = onAuthStateChanged(auth, async (user) => {
      // 初期化（前のアカウントのデータ残さない）
      setUser(user);
      setEventName("共通テスト");
      setTargetDate(new Date().toISOString().split("T")[0]);
      setHasEvent(false);
      setShowInvalidDateMessage(false);

      if (user) {
        const ref = doc(db, "users", user.uid, "settings", "event");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.reset) {
            setHasEvent(false);
            setLoadingEvent(false);
            return;
          }
          const today = new Date();
          const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          const t1 = new Date(data.targetDate).getTime();
          const isPast = t1 < t0;

          if (data.name && data.targetDate && !isPast) {
            setEventName(data.name);
            setTargetDate(data.targetDate);
            setHasEvent(true);
          }
        }
      }
      setLoadingEvent(false);
    });
    return () => unregister();
  }, []);

  const showNotification = (title: string, message: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
    const fileMap: { [key: string]: string } = {
      bell: "bell.mp3",
      chime: "chime.mp3",
      piano: "piano.mp3",
      bird: "bird.mp3",
      "water-flow": "water-flow.mp3",
      drum: "drum.mp3",
      Notify: "Notify.wav",
    };
    const file = fileMap[notificationSound];
    if (file) {
      const audio = new Audio(`/sounds/${file}`);
      audio.play();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    if (isRunning && timeLeft === 0) {
      if (mode === "study") {
        setMode("break");
        setTimeLeft(BREAK_TIME);
        setStatusText("休憩中");
        showNotification("勉強終了", "25分の勉強が終わりました！休憩しましょう🍅");
      } else {
        setMode("study");
        setTimeLeft(STUDY_TIME);
        setStatusText("勉強中");
        showNotification("休憩終了", "休憩が終わりました！勉強を再開しましょう📚");
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };

  const handleFinish = async () => {
    setIsRunning(false);
    setStatusText("終了");

    if (mode === "study") {
      const studiedSeconds = STUDY_TIME - timeLeft;
      const studiedMinutes = Math.floor(studiedSeconds / 60);

      if (studiedMinutes > 0) {
        const today = new Date().toLocaleDateString("sv-SE");
        const user = auth.currentUser;

        if (user) {
          const ref = doc(db, "users", user.uid, "records", today);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const prev = snap.data().minutes || 0;
            await setDoc(ref, { minutes: prev + studiedMinutes });
          } else {
            await setDoc(ref, { minutes: studiedMinutes });
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md border border-black rounded-lg px-6 py-6 space-y-4 bg-white shadow-md">
        {selectedTask && (
          <div className="text-sm text-gray-600 text-center -mb-2">{selectedTask}</div>
        )}

        <div className="text-xl font-bold text-center text-black min-h-[2.5rem]">
          {(() => {
            if (pausedByUser) return "離席中";
            if (isRunning && mode === "study") return "勉強中";
            if (isRunning && mode === "break") return "休憩中";
            return "\u00A0";
          })()}
        </div>
        <div className="mx-auto w-[320px] h-[320px] rounded-full border-[3px] border-black flex flex-col items-center justify-center space-y-6">
          <div className={`text-5xl font-bold ${statusText === "休憩中" ? "text-blue-500" : "text-black"}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (mode === "study") {
                  setIsRunning(true);
                  setStatusText("勉強中");
                  setPausedByUser(false);
                } else if (mode === "break" && !isRunning) {
                  setMode("study");
                  setTimeLeft(STUDY_TIME);
                  setIsRunning(true);
                  setStatusText("勉強中");
                  setPausedByUser(false);
                }
              }}
              className="w-[80px] h-[50px] bg-black text-white rounded-full text-sm font-semibold active:scale-95"
            >
              学習
            </button>
            <button
              onClick={() => {
                if (!pausedByUser) {
                  setIsRunning(false);
                  setStatusText("離席中");
                  setPausedByUser(true);
                } else {
                  setIsRunning(true);
                  setStatusText(mode === "study" ? "勉強中" : "休憩中");
                  setPausedByUser(false);
                }
              }}
              className="w-[80px] h-[50px] bg-white text-black border border-black rounded-full text-sm font-semibold leading-tight text-center active:scale-95 flex items-center justify-center"
            >
              <span className="block leading-tight">
                ちょっと<br />休憩
              </span>
            </button>
            <button
              onClick={() => {
                setTimeLeft(STUDY_TIME);
                setIsRunning(false);
                setMode("study");
                setStatusText("");
                setPausedByUser(false);
              }}
              className="w-[80px] h-[50px] bg-black text-white rounded-full text-sm font-semibold active:scale-95"
            >
              はじめから
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleFinish}
              className="w-[120px] h-[50px] bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 active:scale-90 active:rounded-md transition-all"
            >
              終了
            </button>
          </div>
        </div>

        {/* 吹き出しのトマトキャラとイベント表示 */}
        <div className="flex items-start space-x-3 mt-4">
          <img src="/toma-chan.png" alt="トマト" className="w-24 h-24 object-contain" />
          <div className="relative max-w-[280px] bg-rose-50 text-rose-700 px-4 py-3 rounded-xl shadow-sm text-sm text-center before:content-[''] before:absolute before:left-[-10px] before:top-4 before:w-0 before:h-0 before:border-y-8 before:border-r-[10px] before:border-y-transparent before:border-r-rose-50">
            {!user ? (
              <div>ログインして目標設定しよう🍅</div>
            ) : showInvalidDateMessage ? (
              <div>今後の予定を入れてね！🍅</div>
            ) : !hasEvent ? (
              <div>目標を設定しよう！🍅</div>
            ) : remainingDays === 0 ? (
               <> 
              <div>{eventName}当日！</div>  
              <div>応援してるよ！🍅</div>
              </>
            ) : (
              <>
                <div>{eventName}まで</div>
                <div className="text-3xl font-bold text-black">{remainingDays}日</div>
              </>
            )}
            {user && (
              <button
                onClick={() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  setTargetDate(todayStr);
                  setEditMode((v) => !v);
                  setShowInvalidDateMessage(false);
                }}
                className="block text-xs text-rose-500 underline mt-1"
              >
                {editMode ? "閉じる" : "編集"}
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-3 w-full max-w-md mx-auto p-3 rounded-xl shadow-sm border border-rose-200 bg-rose-50">
            <h3 className="text-sm font-bold text-rose-700 mb-2">🍅 目標日程設定 🍅</h3>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="イベント名（例: 共通テスト）"
                className="w-full px-3 py-2 rounded border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none text-sm"
              />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const today = new Date();
                    const selected = new Date(targetDate);
                    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                    if (selected < todayMidnight) {
                      setShowInvalidDateMessage(true);
                      setEditMode(false);
                      return;
                    }

                    setEditMode(false);
                    setShowInvalidDateMessage(false);

                    if (user) {
                      const ref = doc(db, "users", user.uid, "settings", "event");
                      await setDoc(ref, {
                        name: eventName,
                        targetDate: targetDate,
                        reset: false,
                      });
                      setHasEvent(true);
                    }
                  }}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-full font-semibold transition active:scale-95"
                >
                  🍅 保存
                </button>
                <button
                  onClick={async () => {
                    const todayStr = new Date().toLocaleDateString("sv-SE");
                    setEventName("共通テスト");
                    setTargetDate(todayStr);
                    setEditMode(false);
                    setHasEvent(false);
                    setShowInvalidDateMessage(false);
                    if (user) {
                      const ref = doc(db, "users", user.uid, "settings", "event");
                      await setDoc(ref, {
                        name: "共通テスト",
                        targetDate: todayStr,
                        reset: true,
                      });
                    }
                  }}
                  className="px-3 py-2 text-xs text-rose-600 underline"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* タスク表示 */}
      <div className="mt-8 w-full max-w-md border border-black rounded-lg px-4 py-4 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-3">タスク</h2>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start space-x-2 cursor-pointer"
              onClick={() => setSelectedTask(task.text)}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                className="mt-1"
              />
              <div>
                <div className={`text-base ${task.done ? "line-through text-gray-400" : "text-black"}`}>
                  {task.text}
                </div>
                {task.detail && <div className="text-sm text-gray-500">{task.detail}</div>}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="タスクを入力"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={addTask}
            className="px-3 py-2 bg-black text-white rounded text-sm font-semibold active:scale-95"
          >
            ＋追加
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;


