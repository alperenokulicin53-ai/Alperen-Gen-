import React, { useState } from 'react';
import { MessageSquare, Send, User, Trash2, ShieldCheck, Heart } from 'lucide-react';
import { WeekComment } from '../types/journal';
import { useAuth } from '../context/AuthContext';

interface CommentSectionProps {
  weekNumber: number;
  comments: WeekComment[];
  onAddComment: (payload: { weekNumber: number; authorName: string; content: string }) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export function CommentSection({
  weekNumber,
  comments,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const { isAdmin } = useAuth();
  const [authorName, setAuthorName] = useState(isAdmin ? 'Alperen Genç (Yönetici)' : '');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekComments = comments
    .filter(c => Number(c.weekNumber) === Number(weekNumber))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment({
        weekNumber,
        authorName: authorName.trim(),
        content: content.trim(),
      });
      setContent('');
      if (!isAdmin) {
        // Keep author name for easy consecutive comments
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {weekNumber}. Hafta İnceleme ve Ziyaretçi Yorumları
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Öğretmeniniz veya ziyaretçiler bu haftaya görüş ve geri bildirim bırakabilir.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          {weekComments.length} Yorum
        </span>
      </div>

      {/* New Comment Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-slate-50/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-2xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adınız / Ünvanınız
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Örn: Ders Öğretmeni / Ahmet Yılmaz"
                required
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end justify-end">
            <span className="text-[11px] text-slate-400 italic">
              Herkes yorum yazabilir ve projeleri değerlendirebilir.
            </span>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Yorumunuz / Değerlendirmeniz
          </label>
          <textarea
            rows={2}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Bu haftaki çalışma, proje veya dosya hakkında düşüncelerinizi yazın..."
            required
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !authorName.trim() || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Gönderiliyor...' : 'Yorumu Yayınla'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {weekComments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            Bu haftaya ait henüz bir yorum veya değerlendirme yazılmadı. İlk yorumu siz yazın!
          </div>
        ) : (
          weekComments.map(comment => {
            const isAlperen = comment.authorName.toLowerCase().includes('alperen');
            return (
              <div
                key={comment.id}
                className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      {comment.authorName}
                      {isAlperen && (
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-1.5 py-0.2 rounded font-bold inline-flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Yönetici
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {comment.formattedDate}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      title="Yorumu sil (Sadece Yönetici)"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
