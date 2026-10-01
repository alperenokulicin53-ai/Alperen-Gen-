import React, { useState } from 'react';
import { X, FileText, Link2, AlertCircle } from 'lucide-react';
import { formatTurkeyTimestamp } from '../utils/date';
import { TOTAL_WEEKS } from '../types/journal';

interface AddItemModalProps {
  isOpen: boolean;
  weekNumber: number;
  onClose: () => void;
  onSubmit: (payload: {
    weekNumber: number;
    type: 'post' | 'drive';
    title: string;
    content: string;
    driveUrl?: string;
    formattedDate: string;
  }) => Promise<void>;
}

export function AddItemModal({ isOpen, weekNumber, onClose, onSubmit }: AddItemModalProps) {
  const [activeTab, setActiveTab] = useState<'post' | 'drive'>('post');
  const [targetWeek, setTargetWeek] = useState<number>(weekNumber);

  React.useEffect(() => {
    setTargetWeek(weekNumber);
  }, [weekNumber, isOpen]);
  
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const [driveTitle, setDriveTitle] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveDescription, setDriveDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formattedDate = formatTurkeyTimestamp(new Date());

    if (activeTab === 'post') {
      const trimmedTitle = postTitle.trim();
      const trimmedContent = postContent.trim();

      if (!trimmedTitle) {
        setErrorMessage('Lütfen bir başlık giriniz.');
        return;
      }
      if (!trimmedContent) {
        setErrorMessage('Lütfen gelişime ait içerik/açıklama giriniz.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          weekNumber: targetWeek,
          type: 'post',
          title: trimmedTitle,
          content: trimmedContent,
          formattedDate,
        });
        setPostTitle('');
        setPostContent('');
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Kaydedilirken bir hata oluştu');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const trimmedTitle = driveTitle.trim();
      const trimmedUrl = driveUrl.trim();
      const trimmedDesc = driveDescription.trim() || 'Google Drive proje bağlantısı';

      if (!trimmedTitle) {
        setErrorMessage('Lütfen Drive linki için bir başlık (ör: Proje 1 Sunumu) giriniz.');
        return;
      }
      if (!trimmedUrl) {
        setErrorMessage('Lütfen Google Drive bağlantı adresini (URL) giriniz.');
        return;
      }
      if (!validateUrl(trimmedUrl)) {
        setErrorMessage('Lütfen geçerli bir internet bağlantısı giriniz (https://drive.google.com/...)');
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          weekNumber: targetWeek,
          type: 'drive',
          title: trimmedTitle,
          content: trimmedDesc,
          driveUrl: trimmedUrl,
          formattedDate,
        });
        setDriveTitle('');
        setDriveUrl('');
        setDriveDescription('');
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Kaydedilirken bir hata oluştu');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Haftalık Yenilik Ekle
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulut veritabanına anında kaydedilir ve tüm cihazlarda görünür
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('post')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'post'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Gelişim Notu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'drive'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Google Drive Linki</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Week Selection dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hangi Haftaya Eklenecek?
            </label>
            <select
              value={targetWeek}
              onChange={e => setTargetWeek(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(num => (
                <option key={num} value={num} className="dark:bg-slate-800">
                  {num}. Hafta {num === weekNumber ? '(Şu Anki Seçili)' : ''}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'post' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Başlık
                </label>
                <input
                  type="text"
                  placeholder="Ör: Veritabanı Mimarisi Tasarlandı"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Açıklama / Detaylar
                </label>
                <textarea
                  rows={4}
                  placeholder="Bu hafta yapılan çalışmalar, ulaşılan sonuçlar, karşılaşılan zorluklar..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Başlık
                </label>
                <input
                  type="text"
                  placeholder="Ör: Proje 1 Raporu &amp; Sunum Dosyası"
                  value={driveTitle}
                  onChange={e => setDriveTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Google Drive Bağlantı Linki (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kısa Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ör: Projeye ait tüm kaynak kodları ve sunum slaytı bu Drive klasöründedir."
                  value={driveDescription}
                  onChange={e => setDriveDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Buluta Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
