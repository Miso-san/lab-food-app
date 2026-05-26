import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Member, ConditionalFood } from "../types";

interface MemberFormProps {
  mode: "add" | "edit";
  initial?: Member;
  onSubmit: (member: Member) => Promise<void>;
  onClose: () => void;
}

const EMPTY: Member = {
  id: "", name: "", likes: [], dislikes: [], allergies: [],
  conditionalFoods: [], rankings: {}, memo: "",
};

function TagInput({ label, values, onChange, placeholder, variant }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
  placeholder: string; variant?: "alert" | "never";
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  const cls = variant === "alert"
    ? "text-red-500"
    : variant === "never"
    ? "text-gray-500 dark:text-gray-400"
    : "text-gray-500 dark:text-gray-400";
  const tagCls = variant === "alert"
    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
    : variant === "never"
    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
    : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  return (
    <div className="mb-4">
      <label className={`block text-xs font-semibold mb-1.5 ${cls}`}>{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={add} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map(v => (
          <span key={v} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-medium ${tagCls}`}>
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-red-500 transition-colors"><X size={10} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function MemberForm({ mode, initial, onSubmit, onClose }: MemberFormProps) {
  const [data, setData] = useState<Member>(() => ({
    ...EMPTY,
    ...(initial ?? {}),
    neverEaten: initial?.neverEaten ?? [],
  }));
  const [rankCategory, setRankCategory] = useState("");
  const [rankItems, setRankItems] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Member, value: unknown) => setData(d => ({ ...d, [key]: value }));

  const addConditional = () => set("conditionalFoods", [...data.conditionalFoods, { food: "", condition: "" }]);
  const updateConditional = (i: number, cf: ConditionalFood) => {
    const updated = [...data.conditionalFoods];
    updated[i] = cf;
    set("conditionalFoods", updated);
  };
  const removeConditional = (i: number) => set("conditionalFoods", data.conditionalFoods.filter((_, idx) => idx !== i));

  const addRankCategory = () => {
    const cat = rankCategory.trim();
    if (!cat || data.rankings[cat]) return;
    set("rankings", { ...data.rankings, [cat]: [] });
    setRankCategory("");
  };
  const addRankItem = (category: string) => {
    const item = (rankItems[category] ?? "").trim();
    if (!item) return;
    set("rankings", { ...data.rankings, [category]: [...(data.rankings[category] ?? []), item] });
    setRankItems(prev => ({ ...prev, [category]: "" }));
  };
  const removeRankItem = (category: string, item: string) =>
    set("rankings", { ...data.rankings, [category]: data.rankings[category].filter(x => x !== item) });
  const removeRankCategory = (category: string) => {
    const r = { ...data.rankings };
    delete r[category];
    set("rankings", r);
  };

  const handleSubmit = async () => {
    if (!data.name.trim()) { alert("名前を入力してください"); return; }
    if (!data.id.trim()) data.id = data.name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setSaving(true);
    await onSubmit(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{mode === "add" ? "メンバーを追加" : "メンバーを編集"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="px-5 py-5 space-y-1">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">名前 *</label>
            <input
              value={data.name} onChange={e => set("name", e.target.value)}
              placeholder="例：山田"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <TagInput label="好きな食べ物" values={data.likes} onChange={v => set("likes", v)} placeholder="例：寿司" />
          <TagInput label="苦手な食べ物" values={data.dislikes} onChange={v => set("dislikes", v)} placeholder="例：パクチー" />
          <TagInput label="アレルギー" values={data.allergies} onChange={v => set("allergies", v)} placeholder="例：甲殻類" variant="alert" />
          <TagInput label="食べたことがない" values={data.neverEaten ?? []} onChange={v => set("neverEaten", v)} placeholder="例：ドリアン" variant="never" />

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">条件付きでOK</label>
              <button onClick={addConditional} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"><Plus size={12} />追加</button>
            </div>
            <div className="space-y-2">
              {data.conditionalFoods.map((cf, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input value={cf.food} onChange={e => updateConditional(i, { ...cf, food: e.target.value })} placeholder="食材"
                    className="w-1/3 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={cf.condition} onChange={e => updateConditional(i, { ...cf, condition: e.target.value })} placeholder="条件（例：天ぷらならOK）"
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => removeConditional(i)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1.5">好き嫌いランキング</label>
            <div className="flex gap-2 mb-3">
              <input value={rankCategory} onChange={e => setRankCategory(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRankCategory())}
                placeholder="カテゴリ名（例：麺類）"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addRankCategory} className="px-3 py-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 transition-colors text-sm">追加</button>
            </div>
            <div className="space-y-3">
              {Object.entries(data.rankings).map(([category, items]) => (
                <div key={category} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{category}</span>
                    <button onClick={() => removeRankCategory(category)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                  </div>
                  <div className="space-y-1 mb-2">
                    {items.map((item, rank) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-xs flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold flex-shrink-0">{rank + 1}</span>
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300">{item}</span>
                        <button onClick={() => removeRankItem(category, item)} className="text-red-400 hover:text-red-600"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={rankItems[category] ?? ""} onChange={e => setRankItems(prev => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRankItem(category))}
                      placeholder="アイテムを追加"
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => addRankItem(category)} className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">メモ</label>
            <textarea value={data.memo ?? ""} onChange={e => set("memo", e.target.value)} placeholder="自由メモ（例：辛いものが苦手）" rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "保存中..." : mode === "add" ? "追加する" : "更新する"}
          </button>
        </div>
      </div>
    </div>
  );
}
