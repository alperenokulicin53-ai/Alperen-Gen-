import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CircleDot,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { JournalData, TOTAL_WEEKS, WeekStatus } from '../types/journal';
import { useAuth } from '../context/AuthContext';

interface WeekGridProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onUpdateWeekStatus?: (weekNum: number, status: WeekStatus) => Promise<void>;
  onOpenAddModalForWeek?: (weekNum: number) => void;
}

export function WeekGrid({
  journalData,
  selectedWeek,
  onSelectWeek,
  onUpdateWeekStatus,
}: WeekGridProps) {
  const { isAdmin, openLoginModal } = useAuth();
  const [filter, setFilter] = useState<'all' | 'with_content' | 'completed' | 'empty'>('all');
  // User asked for: "gelişim süreci haritasını birazdaha düzenle biraz büyük" -> default to spacious card view
  const [isCompact, setIsCompact] = useState<boolean>(false);

  const getWeekItems = (weekNum: number) => {
    return (journalData.items || [])
      .filter(item => Number(item.weekNumber) === Number(weekNum))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getWeekStatus = (weekNum: number): WeekStatus => {
    return journalData.weeks[weekNum]?.status || 'not_started';
  };

  const allWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const filteredWeeks = allWeeks.filter(weekNum => {
    const items = getWeekItems(weekNum);
    const status = getWeekStatus(weekNum);
    if (filter === 'with_content') return items.length > 0;
    if (filter === 'completed') return status === 'completed';
    if (filter === 'empty') return items.length === 0 && status === 'not_started';
    return true;
  });

  const handleToggleStatus = (e: React.MouseEvent, weekNum: number) => {
    e.stopPropagation();
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    if (!onUpdateWeekStatus) return;
    const current = getWeekStatus(weekNum);
    const next: WeekStatus = current === 'completed' ? 'not_started' : 'completed';
    onUpdateWeekStatus(weekNum, next);
  };

  return (
    <section id="weeks-top-grid-section" className="py-5 sm:py-7 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar with Title, Filters and View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded">
                  Haftalık Süreç Haritası
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {TOTAL_WEEKS} Hafta
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Yönetici Modu Aktif
                  </span>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Durumları değiştirmek için yönetici girişi yapın"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>(Durumlar için Admin Girişi)</span>
                  </button>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Gelişim ve İlerleme Süreci Haritası
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tümü ({TOTAL_WEEKS})
              </button>
              <button
                onClick={() => setFilter('with_content')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'with_content'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Dolu Haftalar
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yapıldı / Bitti
              </button>
              <button
                onClick={() => setFilter('empty')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'empty'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Boş
              </button>
            </div>

            {/* Toggle Compact / Spacious Grid */}
            <button
              onClick={() => setIsCompact(prev => !prev)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title={isCompact ? 'Genişletilmiş görünüme geç' : 'Daha küçük / kompakt görünüme geç'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isCompact ? 'Kompakt Görünüm' : 'Büyük Kart Görünümü'}</span>
              {isCompact ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 1. COMPACT VIEW (Chip style) */}
        {isCompact ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 gap-2">
            {filteredWeeks.map(weekNum => {
              const items = getWeekItems(weekNum);
              const itemCount = items.length;
              const status = getWeekStatus(weekNum);
              const isSelected = selectedWeek === weekNum;
              const isCompleted = status === 'completed';

              return (
                <div
                  key={weekNum}
                  onClick={() => onSelectWeek(weekNum)}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-105 z-10'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    Hafta
                  </span>
                  <span className="text-base font-extrabold tabular-nums my-0.5">
                    {weekNum}
                  </span>

                  {/* Status Toggle Button in Chip */}
                  <button
                    onClick={(e) => handleToggleStatus(e, weekNum)}
                    type="button"
                    title={
                      !isAdmin
                        ? 'Durum değiştirmek için yönetici girişi yapın'
                        : isCompleted
                        ? 'Yapıldı olarak işaretli (Değiştirmek için tıkla)'
                        : 'Yapılmadı olarak işaretli (Yapıldı yapmak için tıkla)'
                    }
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer ${
                      isCompleted
                        ? isSelected
                          ? 'bg-emerald-400 text-slate-900'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
                    <span>{isCompleted ? 'Yapıldı' : 'Yapılmadı'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. SPACIOUS & BEAUTIFUL CARD VIEW (Larger cards with direct "Yapıldı / Yapılmadı" switch) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredWeeks.map(weekNum => {
              const items = getWeekItems(weekNum);
              const itemCount = items.length;
              const status = getWeekStatus(weekNum);
              const isSelected = selectedWeek === weekNum;
              const isCompleted = status === 'completed';

              return (
                <div
                  key={weekNum}
                  onClick={() => onSelectWeek(weekNum)}
                  className={`group text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500/20 scale-[1.02] z-10'
                      : isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 text-slate-900 dark:text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Header: Week number + Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base sm:text-lg font-black tracking-tight tabular-nums ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {weekNum}. Hafta
                        </span>
                      </div>

                      {isCompleted ? (
                        <span
                          className={`flex items-center text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                          <span>Onaylı / Yapıldı</span>
                        </span>
                      ) : (
                        <span
                          className={`flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                            isSelected
                              ? 'bg-white/10 text-white/80'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <CircleDot className="w-3 h-3 mr-1 inline text-slate-400" />
                          <span>Yapılmadı</span>
                        </span>
                      )}
                    </div>

                    {/* Files & description */}
                    <div className="text-xs mb-3">
                      {itemCount > 0 ? (
                        <span className={`font-semibold ${isSelected ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                          📂 {itemCount} Kayıt / Dosya Mevcut
                        </span>
                      ) : (
                        <span className={`italic ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                          İçerik henüz eklenmedi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar: Yapıldı/Yapılmadı Toggle Button + Details */}
                  <div
                    className={`pt-2.5 mt-2 border-t flex items-center justify-between gap-2 text-xs font-semibold ${
                      isSelected
                        ? 'border-white/20 text-white'
                        : 'border-slate-100 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {/* The requested YAPILDI / YAPILMADI Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, weekNum)}
                      title={
                        !isAdmin
                          ? 'Durumu değiştirmek için Yönetici Girişi yapın'
                          : isCompleted
                          ? 'Yapılmadı olarak değiştir'
                          : 'Yapıldı olarak onayla'
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isCompleted
                          ? isSelected
                            ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : isSelected
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Yapıldı</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Yapılmadı</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>{isSelected ? 'İnceleniyor' : 'Aç'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
