import { useState } from 'react';
import { FileText, ExternalLink, Edit2, Trash2, Calendar, Link2, Copy, Check } from 'lucide-react';
import { WeekItem } from '../types/journal';

interface ItemCardProps {
  item: WeekItem;
  isAdmin: boolean;
  onEdit: (item: WeekItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, isAdmin, onEdit, onDelete }: ItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDrive = item.type === 'drive';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/80 hover:bg-slate-50/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-xs">
      {/* Top Header: Badge, Date, Actions */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {isDrive ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/60">
              <Link2 className="w-3.5 h-3.5" />
              <span>Google Drive Dosyası</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Gelişim &amp; Çalışma Notu</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="font-mono tabular-nums">{item.formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-md p-0.5 text-xs">
              <span className="px-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">Emin misiniz?</span>
              <button
                onClick={() => onDelete(item.id)}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
              >
                İptal
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleCopy}
                title="Metni kopyala"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => onEdit(item)}
                    title="Düzenle"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    title="Sil"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Content Body */}
      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">
        {item.content}
      </p>

      {/* Action Footer: Drive link if applicable */}
      {isDrive && item.driveUrl && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
            <span className="font-medium text-slate-700 dark:text-slate-300">Hedef Bağlantı:</span>
            <span className="font-mono truncate">{item.driveUrl}</span>
          </div>

          <a
            href={item.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <span>Google Drive'da Aç</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
