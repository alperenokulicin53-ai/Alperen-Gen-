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

  // Sync targetWeek with weekNumber when opening
  React.useEffect(() => {
    setTargetWeek(weekNumber);
  }, [weekNumber, isOpen]);
  
  // Post state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  // Drive state
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
        setErrorMessage('Lütfen yazı için bir başlık belirleyin.');
        return;
      }
      if (!trimmedContent) {
        setErrorMessage('Lütfen o haftaya ait çalışmalarınızı anlatan metni girin.');
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
        setErrorMessage(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const trimmedTitle = driveTitle.trim();
      const trimmedUrl = driveUrl.trim();
      const trimmedDesc = driveDescription.trim();

      if (!trimmedTitle) {
        setErrorMessage('Lütfen Google Drive bağlantısı için bir başlık girin.');
        return;
      }
      if (!trimmedUrl) {
        setErrorMessage('Lütfen Google Drive bağlantı URL’sini yapıştırın.');
        return;
      }
      if (!validateUrl(trimmedUrl)) {
        setErrorMessage('Lütfen geçerli bir internet bağlantısı (https://...) girin.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          weekNumber: targetWeek,
          type: 'drive',
          title: trimmedTitle,
          content: trimmedDesc || 'Google Drive bağlantısı',
          driveUrl: trimmedUrl,
          formattedDate,
        });
        setDriveTitle('');
        setDriveUrl('');
        setDriveDescription('');
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-700 font-extrabold">{targetWeek}. Hafta</span>
              <span>İçin Yenilik Ekle</span>
            </h2>
            <p className="text-xs text-slate-500">
              Haftalık çalışmanızı, projenizi veya Google Drive dokümanınızı doğrudan kaydedin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Week Selector Dropdown & Tab Selection */}
        <div className="px-6 pt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700">
              Eklenecek Hafta:
            </label>
            <select
              value={targetWeek}
              onChange={e => setTargetWeek(Number(e.target.value))}
              className="text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>
                  {w}. Hafta
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('post');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'post'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Yazı &amp; Çalışma Notu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('drive');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'drive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Google Drive Bağlantısı</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'post' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Başlık <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="Örn: Proje Altyapısının Kurulumu ve Araştırmalar"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Haftalık Çalışma &amp; Gelişim Detayı <span className="text-rose-500">*</span>
                  </label>
                  {/* Küçük yenilik: Canlı karakter sayacı */}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {postContent.length} karakter
                  </span>
                </div>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Bu hafta hangi adımları attınız? Hangi teknolojileri veya konuları öğrendiniz? Karşılaştığınız zorluklar ve çözümler neler oldu? Detaylı şekilde yazabilirsiniz..."
                  rows={7}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y leading-relaxed font-normal"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bağlantı Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={driveTitle}
                  onChange={e => setDriveTitle(e.target.value)}
                  placeholder="Örn: 1. Hafta Kaynak Kodları ve Tasarım Dosyaları Klasörü"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Google Drive Bağlantısı (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... veya https://docs.google.com/..."
                  className="w-full text-sm font-mono bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Google Drive klasör, PDF, doküman veya dosya paylaşım bağlantınızı doğrudan yapıştırın.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={driveDescription}
                  onChange={e => setDriveDescription(e.target.value)}
                  placeholder="Bu Drive klasöründe veya belgesinde neler yer alıyor? Öğretmeninizin dikkat etmesi gereken özel bir dosya var mı?"
                  rows={4}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
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
              {isSubmitting ? 'Kaydediliyor...' : 'Yeniliği Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
