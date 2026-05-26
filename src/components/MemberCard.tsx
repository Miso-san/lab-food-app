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
      className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onClick(member)}
    >
      <button
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(member.id); }}
        aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
      >
        <Star size={16} className={isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
      </button>

      <div className="p-4">
        {/* アバター */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3 ${colorClass}`}>
          {member.name.charAt(0)}
        </div>

        {/* 名前 */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {member.name}さん
        </h3>

        {/* 好きな食べ物 */}
        {member.likes.length > 0 && (
          <p className="text-xs mb-1 leading-relaxed">
            <span className="text-pink-400">♡</span>
            <span className="text-pink-500 dark:text-pink-400 ml-1">
              {member.likes.slice(0, 3).join("、")}
              {member.likes.length > 3 && `…`}
            </span>
          </p>
        )}

        {/* 苦手な食べ物 */}
        {member.dislikes.length > 0 && (
          <p className="text-xs mb-1 leading-relaxed">
            <span className="text-sky-400">✕</span>
            <span className="text-sky-500 dark:text-sky-400 ml-1">
              {matchingDislike
                ? <span className="font-semibold">{matchingDislike}</span>
                : <>{member.dislikes.slice(0, 3).join("、")}{member.dislikes.length > 3 && `…`}</>
              }
            </span>
          </p>
        )}

        {/* アレルギー */}
        {hasAllergy && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-red-500 dark:text-red-400">
              アレルギー：{member.allergies.join("、")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
