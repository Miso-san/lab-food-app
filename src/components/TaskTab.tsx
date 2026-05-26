import { useState } from "react";
import { Member } from "../types";
import { Plus, X, SkipForward, Users, Utensils } from "lucide-react";

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

// あるメンバーが食材を振り分け済みかどうか
function isAssigned(member: Member, food: string): boolean {
  return (
    member.likes.includes(food) ||
    member.dislikes.includes(food) ||
    (member.neverEaten ?? []).includes(food) ||
    member.conditionalFoods.some(cf => cf.food === food)
  );
}

// 振り分けUIコンポーネント
function SortingUI({ food, memberName, onChoice, onSkip, saving }: {
  food: string;
  memberName: string;
  onChoice: (key: string | null) => void;
  onSkip: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{food}</p>
        <p className="text-xs text-gray-400">{memberName}はどう思う？</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {CHOICES.map(choice => (
          <button
            key={choice.label}
            onClick={() => onChoice(choice.key ?? null)}
            disabled={saving}
            className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${choice.color}`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <button
        onClick={onSkip}
        className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <SkipForward size={14} />スキップ
      </button>
    </div>
  );
}

// メンバー別タブ
function MemberTaskView({ member, taskFoods, onUpdate }: {
  member: Member;
  taskFoods: string[];
  onUpdate: (member: Member) => Promise<void>;
}) {
  const pending = taskFoods.filter(f => !isAssigned(member, f));
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentFood = pending[index] ?? null;
  const isFinished = pending.length === 0 || index >= pending.length;

  const handleChoice = async (key: string | null) => {
    if (!currentFood) return;
    if (key) {
      setSaving(true);
      const field = key as "likes" | "dislikes" | "neverEaten";
      const current = (member[field] ?? []) as string[];
      if (!current.includes(currentFood)) {
        await onUpdate({ ...member, [field]: [...current, currentFood] });
      }
      setSaving(false);
    }
    setIndex(i => i + 1);
  };

  if (pending.length === 0) return (
    <div className="py-12 text-center text-gray-400 dark:text-gray-600">
      <p className="text-3xl mb-2">✅</p>
      <p className="text-sm">振り分け済みの食材はありません</p>
    </div>
  );

  if (isFinished) return (
    <div className="py-12 text-center">
      <p className="text-3xl mb-3">🎉</p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">全て振り分けました！</p>
      <button onClick={() => setIndex(0)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        もう一度
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>残り {pending.length - index} 件</span>
        <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(index / pending.length) * 100}%` }} />
        </div>
      </div>
      <SortingUI
        food={currentFood!}
        memberName={member.name}
        onChoice={handleChoice}
        onSkip={() => setIndex(i => i + 1)}
        saving={saving}
      />
    </div>
  );
}

// 食べ物別タブ
function FoodTaskView({ food, members, onUpdate }: {
  food: string;
  members: Member[];
  onUpdate: (member: Member) => Promise<void>;
}) {
  const pendingMembers = members.filter(m => !isAssigned(m, food));
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentMember = pendingMembers[index] ?? null;
  const isFinished = pendingMembers.length === 0 || index >= pendingMembers.length;

  const handleChoice = async (key: string | null) => {
    if (!currentMember) return;
    if (key) {
      setSaving(true);
      const field = key as "likes" | "dislikes" | "neverEaten";
      const current = (currentMember[field] ?? []) as string[];
      if (!current.includes(food)) {
        await onUpdate({ ...currentMember, [field]: [...current, food] });
      }
      setSaving(false);
    }
    setIndex(i => i + 1);
  };

  if (pendingMembers.length === 0) return (
    <div className="py-12 text-center text-gray-400 dark:text-gray-600">
      <p className="text-3xl mb-2">✅</p>
      <p className="text-sm">全メンバーの振り分けが完了しています</p>
    </div>
  );

  if (isFinished) return (
    <div className="py-12 text-center">
      <p className="text-3xl mb-3">🎉</p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">全メンバーの振り分けが完了しました！</p>
      <button onClick={() => setIndex(0)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        もう一度
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>残り {pendingMembers.length - index} 人</span>
        <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(index / pendingMembers.length) * 100}%` }} />
        </div>
      </div>
      <SortingUI
        food={food}
        memberName={currentMember!.name}
        onChoice={handleChoice}
        onSkip={() => setIndex(i => i + 1)}
        saving={saving}
      />
    </div>
  );
}

// メインコンポーネント
export function TaskTab({ members, onUpdate }: TaskTabProps) {
  const [taskFoods, setTaskFoods] = useState<string[]>([]);
  const [newFood, setNewFood] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"member" | "food">("member");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<string>("");

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
    setTaskFoods(prev => prev.filter(f => f !== food));
    if (selectedFood === food) setSelectedFood("");
  };

  // 全メンバーが振り分け済みの食材はタブから除外
  const activeFoods = taskFoods.filter(food =>
    members.some(m => !isAssigned(m, food))
  );

  const selectedMember = members.find(m => m.id === selectedMemberId) ?? null;

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">好き嫌い振り分けタスク</h2>

      {/* 食材リスト管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">食材リスト</label>
        <div className="flex gap-2 mb-3">
          <input
            value={newFood}
            onChange={e => setNewFood(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFood())}
            placeholder="食材を追加（例：納豆）"
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
            {taskFoods.map(food => {
              const allDone = !members.some(m => !isAssigned(m, food));
              return (
                <span key={food} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-medium ${
                  allDone
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                }`}>
                  {allDone && "✓ "}{food}
                  <button onClick={() => removeFood(food)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {taskFoods.length > 0 && (
        <>
          {/* ビューモード切り替え */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("member")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "member"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Users size={13} />メンバー別
            </button>
            <button
              onClick={() => setViewMode("food")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "food"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Utensils size={13} />食べ物別
            </button>
          </div>

          {/* メンバー別ビュー */}
          {viewMode === "member" && (
            <div className="space-y-3">
              {/* メンバータブ */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {members.map(m => {
                  const pending = taskFoods.filter(f => !isAssigned(m, f)).length;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                        selectedMemberId === m.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : pending === 0
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {m.name}
                      {pending > 0 && <span className="ml-1 opacity-70">({pending})</span>}
                      {pending === 0 && <span className="ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>

              {selectedMember ? (
                <MemberTaskView
                  key={selectedMember.id}
                  member={selectedMember}
                  taskFoods={taskFoods}
                  onUpdate={onUpdate}
                />
              ) : (
                <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                  <p className="text-3xl mb-2">👆</p>
                  <p className="text-sm">メンバーを選択してください</p>
                </div>
              )}
            </div>
          )}

          {/* 食べ物別ビュー */}
          {viewMode === "food" && (
            <div className="space-y-3">
              {/* 食べ物タブ（未完了のみ表示） */}
              {activeFoods.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm">全ての食材の振り分けが完了しました！</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeFoods.map(food => {
                      const remaining = members.filter(m => !isAssigned(m, food)).length;
                      return (
                        <button
                          key={food}
                          onClick={() => setSelectedFood(food)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                            selectedFood === food
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {food}
                          <span className="ml-1 opacity-70">({remaining}人)</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedFood && activeFoods.includes(selectedFood) ? (
                    <FoodTaskView
                      key={selectedFood}
                      food={selectedFood}
                      members={members}
                      onUpdate={onUpdate}
                    />
                  ) : (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                      <p className="text-3xl mb-2">👆</p>
                      <p className="text-sm">食べ物を選択してください</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {taskFoods.length === 0 && (
        <div className="py-12 text-center text-gray-400 dark:text-gray-600">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm">上の食材リストに食材を追加してください</p>
        </div>
      )}
    </div>
  );
}
