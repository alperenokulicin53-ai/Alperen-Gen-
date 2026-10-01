import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  Sparkles,
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
    <section id="week-detail-section" className="py-6 sm:py-8 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Box for Selected Week */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
          {/* Week Detail Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
            {/* Left: Week title & switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={weekNumber <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  title="Önceki Hafta"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={weekNumber >= TOTAL_WEEKS}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  title="Sonraki Hafta"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {weekNumber}. Hafta Detayları
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {weekItems.length} Kayıt
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bu haftaya ait proje çıktıları, çalışmalar ve Google Drive dokümanları
                </p>
              </div>
            </div>

            {/* Right: Status selector & Add button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Status Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs">
                <button
                  onClick={() => handleStatusChange('not_started')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentWeekMeta.status === 'not_started'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5 text-slate-400" />
                  <span>Başlamadı</span>
                </button>

                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentWeekMeta.status === 'in_progress'
                      ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold'
                      : 'text-slate-500 hover:text-amber-700 dark:hover:text-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Devam Ediyor</span>
                </button>

                <button
                  onClick={() => handleStatusChange('completed')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentWeekMeta.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold'
                      : 'text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tamamlandı</span>
                </button>
              </div>

              {/* Direct Add Button for Current Week */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Bu Haftaya Ekle</span>
              </button>
            </div>
          </div>

          {/* Week Items Content */}
          <div className="p-4 sm:p-6">
            {weekItems.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-850/40">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  {weekNumber}. Hafta için Henüz Kayıt Bulunmuyor
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  Öğretmeninizin incelemesi için projenizin bu haftadaki ilerlemesini veya Google Drive bağlantısını hemen ekleyin.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ İlk İçeriği veya Drive Linkini Ekle</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {weekItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isAdmin={true}
                    onEdit={onOpenEditModal}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
