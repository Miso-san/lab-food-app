import { useState, useMemo } from "react";
import { Moon, Sun, Star, Users } from "lucide-react";
import membersData from "./data/members.json";
import { Member, FilterType } from "./types";
import { MemberCard } from "./components/MemberCard";
import { MemberDetail } from "./components/MemberDetail";
import { SearchBar } from "./components/SearchBar";
import { useFavorites } from "./hooks/useFavorites";
import { useDarkMode } from "./hooks/useDarkMode";

const members = membersData as unknown as Member[];

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [dislikeSearch, setDislikeSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = [...members];

    // お気に入りフィルター
    if (showFavoritesOnly) {
      result = result.filter((m) => isFavorite(m.id));
    }

    // 名前検索
    if (query.trim()) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(query.trim().toLowerCase())
      );
    }

    // アレルギーフィルター
    if (filter === "allergy") {
      result = result.filter((m) => m.allergies.length > 0);
    }

    // 嫌いな食べ物横断検索（除外せずハイライトのため全員残す）
    return result;
  }, [query, filter, showFavoritesOnly, favorites]);

  const displayMembers = useMemo(() => {
    if (!dislikeSearch.trim()) return filtered;
    return filtered.filter((m) =>
      m.dislikes.some((d) => d.includes(dislikeSearch.trim()))
    );
  }, [filtered, dislikeSearch]);

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                研究室フードマップ
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">Lab Food Preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              className={`p-2 rounded-xl transition-colors ${
                showFavoritesOnly
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              }`}
              aria-label="お気に入りのみ表示"
            >
              <Star size={18} className={showFavoritesOnly ? "fill-amber-400" : ""} />
            </button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="ダークモード切り替え"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* 検索バー */}
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          dislikeSearch={dislikeSearch}
          onDislikeSearchChange={setDislikeSearch}
          totalCount={members.length}
          filteredCount={displayMembers.length}
        />

        {/* お気に入りのみ表示中バナー */}
        {showFavoritesOnly && (
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            お気に入りのメンバーのみ表示中
          </div>
        )}

        {/* メンバーグリッド */}
        {displayMembers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-600">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm">該当するメンバーが見つかりません</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {displayMembers.map((member) => (
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

      {/* 詳細モーダル */}
      {selectedMember && (
        <MemberDetail
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
