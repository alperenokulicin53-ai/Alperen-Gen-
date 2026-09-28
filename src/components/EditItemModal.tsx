import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { WeekItem } from '../types/journal';

interface EditItemModalProps {
  isOpen: boolean;
  item: WeekItem | null;
  onClose: () => void;
  onUpdate: (
    id: string,
    payload: { title?: string; content?: string; driveUrl?: string }
  ) => Promise<void>;
}

export function EditItemModal({ isOpen, item, onClose, onUpdate }: EditItemModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content);
      setDriveUrl(item.driveUrl || '');
      setErrorMessage(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setErrorMessage('Başlık boş bırakılamaz.');
      return;
    }
    if (!trimmedContent) {
      setErrorMessage('İçerik boş bırakılamaz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(item.id, {
        title: trimmedTitle,
        content: trimmedContent,
        driveUrl: item.type === 'drive' ? driveUrl.trim() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Güncelleme başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Yeniliği Düzenle
            </h2>
            <p className="text-xs text-slate-500">
              {item.weekNumber}. Hafta için eklenen kaydı güncelleyin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Başlık <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {item.type === 'drive' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Google Drive URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={driveUrl}
                onChange={e => setDriveUrl(e.target.value)}
                className="w-full text-sm font-mono bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {item.type === 'drive' ? 'Açıklama' : 'Metin / Detay'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y leading-relaxed font-normal"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
