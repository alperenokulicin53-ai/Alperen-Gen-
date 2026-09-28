import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Link2,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { JournalData, WeekItem, TOTAL_WEEKS } from '../types/journal';

interface AllWeeksListProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModalForWeek: (weekNum: number) => void;
  onOpenEditModal: (item: WeekItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
}

export function AllWeeksList({
  journalData,
  selectedWeek,
  onSelectWeek,
  onOpenAddModalForWeek,
  onOpenEditModal,
  onDeleteItem,
}: AllWeeksListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const allWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="all-weeks-record-section" className="py-12 bg-slate-50/70 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                Eksiksiz Süreç Kaydı
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">1 — 30. Hafta</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bütün Haftalık Gelişim Kayıtları
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              30 haftanın tüm gelişim alanları burada tek tek listelenir; yazdıkça anında güncellenir.
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium self-start sm:self-auto shadow-2xs">
            Toplam <span className="font-bold text-blue-600">{TOTAL_WEEKS}</span> Hafta
          </div>
        </div>

        {/* 30 Weeks Sequential Full Feed */}
        <div className="space-y-6">
          {allWeeks.map(weekNum => {
            const meta = journalData.weeks[weekNum] || { weekNumber: weekNum, status: 'not_started' };
            const items = journalData.items
              .filter(it => it.weekNumber === weekNum)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const isSelected = selectedWeek === weekNum;

            return (
              <div
                key={weekNum}
                id={`week-card-${weekNum}`}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Week Header Banner */}
                <div className="px-5 sm:px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-sm tabular-nums">
                      {weekNum}. Hafta
                    </span>

                    {meta.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Tamamlandı</span>
                      </span>
                    ) : meta.status === 'in_progress' || items.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Devam Ediyor</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        <CircleDot className="w-3 h-3 text-slate-400" />
                        <span>İçerik Eklenmemiş</span>
                      </span>
                    )}
                  </div>

                  {/* Actions for this week */}
                  <div className="flex items-center gap-2">
                    {/* Blue "+ Yenilik Ekle" button */}
                    <button
                      onClick={() => onOpenAddModalForWeek(weekNum)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Yenilik Ekle</span>
                    </button>

                    {/* Jump to Detail View */}
                    <button
                      onClick={() => onSelectWeek(weekNum)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <span>İncele</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Week Content Body */}
                <div className="p-5 sm:p-6">
                  {items.length === 0 ? (
                    <div className="py-5 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-400 font-medium">
                        Bu hafta için henüz gelişim notu veya Google Drive bağlantısı eklenmedi.
                      </span>
                      <button
                        onClick={() => onOpenAddModalForWeek(weekNum)}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>İlk yeniliği şimdi ekle</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {item.type === 'drive' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                  <Link2 className="w-3 h-3 text-blue-600" />
                                  <span>Google Drive</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                  <FileText className="w-3 h-3 text-slate-500" />
                                  <span>Gelişim Notu</span>
                                </span>
                              )}

                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="font-mono tabular-nums">{item.formattedDate}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Küçük yenilik: Metni kopyalama butonu */}
                              <button
                                onClick={() => handleCopyText(item.id, `${item.title}\n\n${item.content}`)}
                                title="Notu panoya kopyala"
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => onOpenEditModal(item)}
                                title="Düzenle"
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-white rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                    onDeleteItem(item.id);
                                  }
                                }}
                                title="Sil"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mb-1.5">
                            {item.title}
                          </h4>

                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                            {item.content}
                          </p>

                          {item.type === 'drive' && item.driveUrl && (
                            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border">
                              <span className="truncate text-xs font-mono text-slate-600">
                                {item.driveUrl}
                              </span>
                              <a
                                href={item.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-2xs"
                              >
                                <span>Drive'da Aç</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
