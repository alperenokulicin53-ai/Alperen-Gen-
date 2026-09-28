import { useState } from 'react';
import { FileText, ExternalLink, Edit2, Trash2, Calendar, Link2, Copy, Check } from 'lucide-react';
import { WeekItem } from '../types/journal';

interface ItemCardProps {
  item: WeekItem;
  isAdmin: boolean;
  onEdit: (item: WeekItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDrive = item.type === 'drive';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50/60 hover:bg-slate-50/90 border border-slate-200/90 rounded-xl p-5 sm:p-6 transition-all duration-200 shadow-xs">
      {/* Top Header: Badge, Date, Actions */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isDrive ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/60">
              <Link2 className="w-3.5 h-3.5" />
              <span>Google Drive Dosyası</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Gelişim &amp; Çalışma Notu</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono tabular-nums">{item.formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-white border border-rose-200 rounded-md p-0.5 text-xs">
              <span className="px-1 text-[11px] text-rose-600 font-medium">Emin misiniz?</span>
              <button
                onClick={() => onDelete(item.id)}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors cursor-pointer"
              >
                İptal
              </button>
            </div>
          ) : (
            <>
              {/* Küçük yenilik: Panoya Kopyala */}
              <button
                onClick={handleCopy}
                title="İçeriği Kopyala"
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => onEdit(item)}
                title="Düzenle"
                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                title="Sil"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Content Text */}
      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal mb-3">
        {item.content}
      </div>

      {/* Drive Link Box */}
      {isDrive && item.driveUrl && (
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border">
          <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-600">
            <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate font-mono">{item.driveUrl}</span>
          </div>
          <a
            href={item.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <span>Drive'da Aç</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
