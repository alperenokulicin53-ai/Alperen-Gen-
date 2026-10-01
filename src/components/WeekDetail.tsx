import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  Sparkles,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { JournalData, WeekItem, WeekStatus, TOTAL_WEEKS } from '../types/journal';
import { ItemCard } from './ItemCard';
import { CommentSection } from './CommentSection';
import { useAuth } from '../context/AuthContext';

interface WeekDetailProps {
  weekNumber: number;
  journalData: JournalData;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: WeekItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onUpdateWeekStatus: (weekNum: number, status: WeekStatus) => Promise<void>;
  onAddComment: (payload: { weekNumber: number; authorName: string; content: string }) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export function WeekDetail({
  weekNumber,
  journalData,
  onSelectWeek,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteItem,
  onUpdateWeekStatus,
  onAddComment,
  onDeleteComment,
}: WeekDetailProps) {
  const { isAdmin, openLoginModal } = useAuth();

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

  const handleToggleStatus = async () => {
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    const nextStatus: WeekStatus = currentWeekMeta.status === 'completed' ? 'not_started' : 'completed';
    await onUpdateWeekStatus(weekNumber, nextStatus);
  };

  const isCompleted = currentWeekMeta.status === 'completed';

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
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Önceki Hafta"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={weekNumber >= TOTAL_WEEKS}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Sonraki Hafta"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {weekNumber}. Hafta Detayları
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">/ {TOTAL_WEEKS} Hafta</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {weekItems.length} kayıtlı çalışma · Google Drive ve Proje Dosyaları
                </p>
              </div>
            </div>

            {/* Right: Yapıldı / Yapılmadı Status button + Add button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Yapıldı / Yapılmadı Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  title={
                    !isAdmin
                      ? 'Durumu değiştirmek için Yönetici Girişi yapın'
                      : isCompleted
                      ? 'Durumu Yapılmadı olarak değiştir'
                      : 'Haftayı Onaylı / Yapıldı olarak işaretle'
                  }
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Bu Hafta Yapıldı (Onaylı)</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-rose-500" />
                      <span>Bu Hafta Yapılmadı</span>
                    </>
                  )}
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
                </button>
              </div>

              {/* Direct Add Button for Current Week (Admin Only) */}
              {isAdmin ? (
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bu Haftaya Ekle</span>
                </button>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                  title="Yenilik veya dosya eklemek için Yönetici girişi yapın"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Girişi ile Ekle</span>
                </button>
              )}
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
                  Öğretmeninizin incelemesi için projenizin bu haftadaki ilerlemesini veya Google Drive bağlantısını ekleyebilirsiniz.
                </p>
                {isAdmin ? (
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ İlk İçeriği veya Drive Linkini Ekle</span>
                  </button>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>İçerik Eklemek İçin Yönetici Girişi Yapın</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {weekItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onEdit={onOpenEditModal}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            )}

            {/* Comment Section below Week Items */}
            <CommentSection
              weekNumber={weekNumber}
              comments={journalData.comments || []}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
