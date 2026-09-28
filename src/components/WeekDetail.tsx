import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  Calendar,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { JournalData, WeekItem, WeekStatus, TOTAL_WEEKS } from '../types/journal';
import { ItemCard } from './ItemCard';

interface WeekDetailProps {
  weekNumber: number;
  journalData: JournalData;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: WeekItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onUpdateWeekStatus: (weekNum: number, status: WeekStatus) => Promise<void>;
  onScrollToBottomWeeks?: () => void;
}

export function WeekDetail({
  weekNumber,
  journalData,
  onSelectWeek,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteItem,
  onUpdateWeekStatus,
}: WeekDetailProps) {
  const currentWeekMeta = journalData.weeks[weekNumber] || {
    weekNumber,
    status: 'not_started',
  };

  // Get items for this week, sorted newest first (ensuring numeric comparison)
  const weekItems = (journalData.items || [])
    .filter(item => Number(item.weekNumber) === Number(weekNumber))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePrev = () => {
    if (weekNumber > 1) {
      onSelectWeek(weekNumber - 1);
    }
  };

  const handleNext = () => {
    if (weekNumber < TOTAL_WEEKS) {
      onSelectWeek(weekNumber + 1);
    }
  };

  const handleStatusChange = async (newStatus: WeekStatus) => {
    await onUpdateWeekStatus(weekNumber, newStatus);
  };

  return (
    <section id="week-detail-section" className="py-8 bg-slate-50/40 border-t border-slate-200 min-h-[420px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Bar between weeks */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              Aktif Hafta
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              (Sol ve Sağ ok tuşları ile geçebilirsiniz)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrev}
              disabled={weekNumber <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Önceki Hafta</span>
            </button>

            <span className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs tabular-nums shadow-xs">
              {weekNumber} / {TOTAL_WEEKS}
            </span>

            <button
              onClick={handleNext}
              disabled={weekNumber >= TOTAL_WEEKS}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Sonraki Hafta</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Week Banner Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700">
                  Gelişim Süreci
                </span>
                <span className="text-slate-300">·</span>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{weekItems.length} kayıt mevcut</span>
                </div>
              </div>

              {/* Hafta Başlığı - Sade ve Doğrudan */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {weekNumber}. Hafta
              </h1>
            </div>

            {/* Right Action: "+ Yenilik Ekle" Önemli Mavi Buton */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Yenilik Ekle</span>
              </button>
            </div>
          </div>

          {/* Week Status & Quick info */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Hafta Durumu:</span>
              {currentWeekMeta.status === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-semibold border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tamamlandı</span>
                </span>
              ) : currentWeekMeta.status === 'in_progress' || weekItems.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Devam Ediyor</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  <CircleDot className="w-3.5 h-3.5 text-slate-400" />
                  <span>İçerik Eklenmemiş</span>
                </span>
              )}
            </div>

            {/* Status switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <span className="text-[11px] text-slate-500 font-medium px-2">Durum Seç:</span>
              <button
                onClick={() => handleStatusChange('not_started')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  currentWeekMeta.status === 'not_started'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Eklenmedi
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  currentWeekMeta.status === 'in_progress'
                    ? 'bg-white text-amber-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Devam Ediyor
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  currentWeekMeta.status === 'completed'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Tamamlandı
              </button>
            </div>
          </div>
        </div>

        {/* List of Items for this Week */}
        <div className="space-y-4">
          {weekItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                <CircleDot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {weekNumber}. Hafta için henüz bir kayıt bulunmuyor.
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Aşağıdaki butona tıklayarak doğrudan yazı veya Google Drive bağlantısı ekleyebilirsiniz.
              </p>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Bu Haftaya İlk Yeniliği Ekle</span>
              </button>
            </div>
          ) : (
            weekItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                isAdmin={true}
                onEdit={onOpenEditModal}
                onDelete={onDeleteItem}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
