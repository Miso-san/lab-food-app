import { Member } from "../types";
import { Star } from "lucide-react";

interface MemberCardProps {
  member: Member;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (member: Member) => void;
  highlightDislike?: string;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
];

function hashColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function MemberCard({ member, isFavorite, onToggleFavorite, onClick, highlightDislike }: MemberCardProps) {
  const colorClass = hashColor(member.id);
  const hasAllergy = member.allergies.length > 0;
  const matchingDislike = highlightDislike
    ? member.dislikes.find((d) => d.includes(highlightDislike))
    : null;

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onClick(member)}
    >
      {/* お気に入りボタン */}
      <button
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(member.id);
        }}
        aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
      >
        <Star
          size={16}
          className={isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}
        />
      </button>

      <div className="p-5">
        {/* アバター */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-4 ${colorClass}`}>
          {member.name.charAt(0)}
        </div>

        {/* 名前 */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {member.name}さん
        </h3>

        {/* バッジ */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hasAllergy && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              ⚠ アレルギーあり
            </span>
          )}
          {member.conditionalFoods.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
              条件付きあり
            </span>
          )}
        </div>

        {/* 嫌いな食べ物ハイライト */}
        {matchingDislike && (
          <div className="mt-2 px-2 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-400">
            ✗ {matchingDislike} が苦手
          </div>
        )}

        {/* 好きな食べ物プレビュー */}
        {!matchingDislike && member.likes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.likes.slice(0, 3).map((food) => (
              <span
                key={food}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {food}
              </span>
            ))}
            {member.likes.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 dark:text-gray-500">
                +{member.likes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* アレルギー詳細 */}
        {hasAllergy && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">
              アレルギー: {member.allergies.join("、")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
