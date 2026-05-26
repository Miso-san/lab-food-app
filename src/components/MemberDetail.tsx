import { Member } from "../types";
import { X, Heart, ThumbsDown, AlertTriangle, Info, Trophy, Pencil, Trash2, Utensils } from "lucide-react";

interface MemberDetailProps {
  member: Member;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
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

function Section({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 mb-2.5 text-sm font-semibold ${color}`}>{icon}{title}</div>
      {children}
    </div>
  );
}

function TagList({ items, variant }: { items: string[]; variant: "default" | "bad" | "alert" | "never" }) {
  if (items.length === 0) return <p className="text-sm text-gray-400 dark:text-gray-500">なし</p>;
  const cls = {
    default: "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    bad: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    alert: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    never: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600",
  }[variant];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span key={item} className={`px-2.5 py-1 rounded-full text-xs border font-medium ${cls}`}>{item}</span>
      ))}
    </div>
  );
}

export function MemberDetail({ member, onClose, onEdit, onDelete }: MemberDetailProps) {
  const colorClass = hashColor(member.id);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center gap-4 rounded-t-3xl sm:rounded-t-2xl">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${colorClass}`}>
            {member.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{member.name}さん</h2>
            {member.allergies.length > 0 && <p className="text-xs text-red-500 dark:text-red-400">⚠ アレルギーあり</p>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(member)} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"><Pencil size={17} /></button>
            <button onClick={() => onDelete(member)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"><Trash2 size={17} /></button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"><X size={20} /></button>
          </div>
        </div>

        <div className="px-5 py-5">
          {member.memo && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <Info size={15} className="flex-shrink-0 mt-0.5" /><p>{member.memo}</p>
            </div>
          )}
          {member.allergies.length > 0 && (
            <Section icon={<AlertTriangle size={14} />} title="アレルギー" color="text-red-600 dark:text-red-400">
              <TagList items={member.allergies} variant="alert" />
            </Section>
          )}
          <Section icon={<Heart size={14} />} title="好きな食べ物" color="text-pink-500 dark:text-pink-400">
            <TagList items={member.likes} variant="default" />
          </Section>
          <Section icon={<ThumbsDown size={14} />} title="苦手な食べ物" color="text-sky-500 dark:text-sky-400">
            <TagList items={member.dislikes} variant="bad" />
          </Section>
          {member.conditionalFoods.length > 0 && (
            <Section icon={<Info size={14} />} title="条件付きでOK" color="text-yellow-600 dark:text-yellow-400">
              <div className="space-y-2">
                {member.conditionalFoods.map((cf, i) => (
                  <div key={i} className="px-3 py-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm">
                    <span className="font-semibold text-yellow-800 dark:text-yellow-300">{cf.food}</span>
                    <span className="text-gray-500 dark:text-gray-400"> — </span>
                    <span className="text-gray-700 dark:text-gray-300">{cf.condition}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {(member.neverEaten ?? []).length > 0 && (
            <Section icon={<Utensils size={14} />} title="食べたことがない" color="text-gray-500 dark:text-gray-400">
              <TagList items={member.neverEaten ?? []} variant="never" />
            </Section>
          )}
          {Object.keys(member.rankings).length > 0 && (
            <Section icon={<Trophy size={14} />} title="好き嫌いランキング" color="text-violet-600 dark:text-violet-400">
              <div className="space-y-4">
                {Object.entries(member.rankings).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{category}</p>
                    <div className="space-y-1.5">
                      {items.map((item, rank) => (
                        <div key={item} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            rank === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                            rank === 1 ? "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300" :
                            rank === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                            "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}>{rank + 1}</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
