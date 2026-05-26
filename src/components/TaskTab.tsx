import { useState } from "react";
import { Member } from "../types";
import { Plus, X, SkipForward } from "lucide-react";

interface TaskTabProps {
  members: Member[];
  onUpdate: (member: Member) => Promise<void>;
}

const CHOICES = [
  { label: "好き", key: "likes", color: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40" },
  { label: "嫌い", key: "dislikes", color: "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40" },
  { label: "どちらでもない", key: null, color: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600" },
  { label: "食べたことがない", key: "neverEaten", color: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600" },
] as const;

export function TaskTab({ members, onUpdate }: TaskTabProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [taskFoods, setTaskFoods] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newFood, setNewFood] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedMember = members.find(m => m.id === selectedMemberId) ?? null;
  const currentFood = taskFoods[currentIndex] ?? null;
  const isFinished = taskFoods.length > 0 && currentIndex >= taskFoods.length;

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  const addFood = () => {
    const f = newFood.trim();
    if (!f) return;
    if (taskFoods.includes(f)) {
      showMessage(`「${f}」はすでにタスクに登録済みです`);
      setNewFood("");
      return;
    }
    setTaskFoods(prev => [...prev, f]);
    setNewFood("");
  };

  const removeFood = (food: string) => {
    setTaskFoods(prev => {
      const next = prev.filter(f => f !== food);
      if (currentIndex >= next.length) setCurrentIndex(Math.max(0, next.length - 1));
      return next;
    });
  };

  const handleChoice = async (key: string | null) => {
    if (!selectedMember || !currentFood) return;
    if (key) {
      setSaving(true);
      const field = key as "likes" | "dislikes" | "neverEaten";
      const current = selectedMember[field] ?? [];
      if (!current.includes(currentFood)) {
        const updated: Member = { ...selectedMember, [field]: [...current, currentFood] };
        await onUpdate(updated);
      }
      setSaving(false);
    }
    setCurrentIndex(i => i + 1);
  };

  const handleSkip = () => setCurrentIndex(i => i + 1);

  const handleReset = () => {
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">好き嫌い振り分けタスク</h2>

      {/* メンバー選択 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">振り分けるメンバーを選択</label>
        <select
          value={selectedMemberId}
          onChange={e => { setSelectedMemberId(e.target.value); setCurrentIndex(0); }}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">メンバーを選んでください</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}さん</option>
          ))}
        </select>
      </div>

      {/* タスク食材管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">タスクの食材リスト</label>
        <div className="flex gap-2 mb-3">
          <input
            value={newFood}
            onChange={e => setNewFood(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFood())}
            placeholder="食材を追加（例：トリュフ）"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addFood} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        {message && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            {message}
          </div>
        )}
        {taskFoods.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {taskFoods.map((food, i) => (
              <span key={food} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-medium ${
                i < currentIndex
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                  : i === currentIndex
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
              }`}>
                {food}
                <button onClick={() => removeFood(food)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 振り分けUI */}
      {selectedMember && taskFoods.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          {isFinished ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">全ての食材を振り分けました！</p>
              <p className="text-xs text-gray-400 mb-4">{selectedMember.name}さんのデータが更新されました</p>
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                もう一度
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-xs text-gray-400 mb-1">{currentIndex + 1} / {taskFoods.length}</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(currentIndex / taskFoods.length) * 100}%` }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentFood}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedMember.name}さんはどう思う？</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {CHOICES.map(choice => (
                  <button
                    key={choice.label}
                    onClick={() => handleChoice(choice.key ?? null)}
                    disabled={saving}
                    className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${choice.color}`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSkip}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SkipForward size={14} />
                スキップ
              </button>
            </>
          )}
        </div>
      )}

      {!selectedMember && (
        <div className="py-12 text-center text-gray-400 dark:text-gray-600">
          <p className="text-3xl mb-2">👆</p>
          <p className="text-sm">メンバーを選択してください</p>
        </div>
      )}
    </div>
  );
}
