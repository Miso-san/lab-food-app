import { useState, useEffect, useMemo } from "react";
import { Moon, Sun, Star, Users, Loader2, Plus } from "lucide-react";
import { Member, FilterType } from "./types";
import { MemberCard } from "./components/MemberCard";
import { MemberDetail } from "./components/MemberDetail";
import { MemberForm } from "./components/MemberForm";
import { SearchBar } from "./components/SearchBar";
import { useFavorites } from "./hooks/useFavorites";
import { useDarkMode } from "./hooks/useDarkMode";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzTAOhc9X34suOh_J-DfOow1VksJjCoQfvjaVsrJh4T0wSlkmDd7DGi2QIVtyjgoPtDMg/exec";

export function parseMemberRow(row: Record<string, string>): Member {
  const split = (s: string) => s ? s.split("，").map(x => x.trim()).filter(Boolean) : [];
  const conditionalFoods = split(row.conditionalFoods).map(cf => {
    const [food, condition] = cf.split(":");
    return { food: food?.trim() ?? "", condition: condition?.trim() ?? "" };
  });
  const rankings: Record<string, string[]> = {};
  if (row.rankings) {
    row.rankings.split(";").filter(Boolean).forEach(entry => {
      const [category, items] = entry.split("=");
      if (category && items) rankings[category.trim()] = items.split("，").map(s => s.trim()).filter(Boolean);
    });
  }
  return {
    id: row.id ?? "",
    name: row.name ?? "",
    likes: split(row.likes),
    dislikes: split(row.dislikes),
    allergies: split(row.allergies),
    conditionalFoods,
    rankings,
    memo: row.memo ?? "",
  };
}

export function memberToRow(member: Member): Record<string, string> {
  return {
    id: member.id,
    name: member.name,
    likes: member.likes.join("，"),
    dislikes: member.dislikes.join("，"),
    allergies: member.allergies.join("，"),
    conditionalFoods: member.conditionalFoods.map(cf => `${cf.food}:${cf.condition}`).join("，"),
    rankings: Object.entries(member.rankings).map(([k, v]) => `${k}=${v.join("，")}`).join(";"),
    memo: member.memo ?? "",
  };
}

export async function apiCall(action: string, member: Member) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({ action, member: memberToRow(member) }),
  });
  return res.json();
}

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [dislikeSearch, setDislikeSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    fetch(GAS_URL)
      .then(res => res.json())
      .then((rows: Record<string, string>[]) => {
        setMembers(rows.map(parseMemberRow));
        setLoading(false);
      })
      .catch(() => {
        setError("データの読み込みに失敗しました");
        setLoading(false);
      });
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async (member: Member) => {
    await apiCall("add", member);
    setFormMode(null);
    fetchMembers();
  };

  const handleUpdate = async (member: Member) => {
    await apiCall("update", member);
    setFormMode(null);
    setEditTarget(null);
    fetchMembers();
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`${member.name}さんを削除しますか？`)) return;
    await apiCall("delete", member);
    setSelectedMember(null);
    fetchMembers();
  };

  const filtered = useMemo(() => {
    let result = [...members];
    if (showFavoritesOnly) result = result.filter(m => isFavorite(m.id));
    if (query.trim()) result = result.filter(m => m.name.toLowerCase().includes(query.trim().toLowerCase()));
    if (filter === "allergy") result = result.filter(m => m.allergies.length > 0);
    return result;
  }, [query, filter, showFavoritesOnly, members, isFavorite]);

  const displayMembers = useMemo(() => {
    if (!dislikeSearch.trim()) return filtered;
    return filtered.filter(m => m.dislikes.some(d => d.includes(dislikeSearch.trim())));
  }, [filtered, dislikeSearch]);

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">データを読み込み中...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-6">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">研究室フードマップ</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Lab Food Preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditTarget(null); setFormMode("add"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span>メンバー追加</span>
            </button>
            <button
              onClick={() => setShowFavoritesOnly(v => !v)}
              className={`p-2 rounded-xl transition-colors ${showFavoritesOnly ? "bg-amber-100 dark:bg-amber-900/40 text-amber-500" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"}`}
            >
              <Star size={18} className={showFavoritesOnly ? "fill-amber-400" : ""} />
            </button>
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5 lg:flex lg:gap-6">
        <aside className="lg:w-72 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">検索・絞り込み</p>
              <SearchBar
                query={query} onQueryChange={setQuery}
                filter={filter} onFilterChange={setFilter}
                dislikeSearch={dislikeSearch} onDislikeSearchChange={setDislikeSearch}
                totalCount={members.length} filteredCount={displayMembers.length}
              />
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{members.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">メンバー数</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-red-500 dark:text-red-400">{members.filter(m => m.allergies.length > 0).length}</p>
                <p className="text-xs text-gray-400 mt-0.5">アレルギー</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 mt-4 lg:mt-0">
          <div className="lg:hidden mb-4">
            <SearchBar
              query={query} onQueryChange={setQuery}
              filter={filter} onFilterChange={setFilter}
              dislikeSearch={dislikeSearch} onDislikeSearchChange={setDislikeSearch}
              totalCount={members.length} filteredCount={displayMembers.length}
            />
          </div>
          {displayMembers.length === 0 ? (
            <div className="py-24 text-center text-gray-400 dark:text-gray-600">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-sm">該当するメンバーが見つかりません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isFavorite={isFavorite(member.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={setSelectedMember}
                  highlightDislike={dislikeSearch.trim() || undefined}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedMember && (
        <MemberDetail
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(m: Member) => { setEditTarget(m); setFormMode("edit"); setSelectedMember(null); }}
          onDelete={handleDelete}
        />
      )}

      {formMode && (
        <MemberForm
          mode={formMode}
          initial={editTarget ?? undefined}
          onSubmit={formMode === "add" ? handleAdd : handleUpdate}
          onClose={() => { setFormMode(null); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
