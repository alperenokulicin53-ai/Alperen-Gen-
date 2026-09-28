import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Calendar, User } from 'lucide-react';
import { WeekComment } from '../types/journal';
import { formatTurkeyTimestamp } from '../utils/date';

interface CommentsSectionProps {
  weekNumber: number;
  comments: WeekComment[];
  isAdmin?: boolean;
  onAddComment: (payload: { weekNumber: number; authorName: string; content: string; formattedDate: string }) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export function CommentsSection({
  weekNumber,
  comments,
  onAddComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter comments for this week only and sort newest to oldest
  const weekComments = comments
    .filter(c => c.weekNumber === weekNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = authorName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setErrorMsg('Lütfen adınızı veya unvanınızı giriniz.');
      return;
    }
    if (!trimmedContent) {
      setErrorMsg('Lütfen bir yorum veya değerlendirme yazınız.');
      return;
    }
    if (trimmedContent.length < 3) {
      setErrorMsg('Yorum en az 3 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = formatTurkeyTimestamp(new Date());
      await onAddComment({
        weekNumber,
        authorName: trimmedName,
        content: trimmedContent,
        formattedDate,
      });
      setContent('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Yorum gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-700" />
          <h3 className="text-lg font-bold text-slate-900">
            {weekNumber}. Hafta Değerlendirme &amp; Yorumlar
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-1 tabular-nums">
            {weekComments.length}
          </span>
        </div>
      </div>

      {/* New Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 sm:p-6 mb-8 shadow-xs"
      >
        <h4 className="text-sm font-bold text-slate-800 mb-3">
          Öğretmen Değerlendirmesi veya Geri Bildirim Bırakın
        </h4>

        {errorMsg && (
          <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-md">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Ad Soyad / Unvan
            </label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Örn: Mehmet Öğretmen"
              maxLength={60}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Yorum / Değerlendirme Metni
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Bu haftanın çalışmaları hakkında düşüncelerinizi, önerilerinizi veya tebriklerinizi paylaşın..."
              rows={2}
              maxLength={1000}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Gönderiliyor...' : 'Yorum Gönder'}</span>
          </button>
        </div>
      </form>

      {/* Existing Comments List */}
      {weekComments.length === 0 ? (
        <div className="text-center py-8 text-xs sm:text-sm text-slate-400 italic">
          Bu hafta için henüz bir yorum veya değerlendirme yazılmadı.
        </div>
      ) : (
        <div className="space-y-3">
          {weekComments.map(comment => (
            <div
              key={comment.id}
              className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{comment.authorName}</span>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="font-mono tabular-nums">{comment.formattedDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                      onDeleteComment(comment.id);
                    }
                  }}
                  title="Yorumu Sil"
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Sil</span>
                </button>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed pl-8">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
