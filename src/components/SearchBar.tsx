import { Search, AlertTriangle, X } from "lucide-react";
import { FilterType } from "../types";

interface SearchBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  filter: FilterType;
  onFilterChange: (v: FilterType) => void;
  dislikeSearch: string;
  onDislikeSearchChange: (v: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  dislikeSearch,
  onDislikeSearchChange,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  return (
    <div className="space-y-3">
      {/* メイン検索 */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="名前で検索..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 嫌いな食べ物横断検索 */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">✗</span>
        <input
          type="text"
          placeholder="苦手な食べ物で横断検索（例：パクチー）"
          value={dislikeSearch}
          onChange={(e) => onDislikeSearchChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {dislikeSearch && (
          <button
            onClick={() => onDislikeSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* フィルターとカウント */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            全員
          </button>
          <button
            onClick={() => onFilterChange("allergy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "allergy"
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <AlertTriangle size={11} />
            アレルギー持ち
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {filteredCount} / {totalCount} 人
        </p>
      </div>
    </div>
  );
}
