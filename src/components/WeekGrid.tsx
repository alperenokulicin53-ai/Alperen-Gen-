import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, CircleDot, ChevronDown, ChevronUp, LayoutGrid, ListFilter } from 'lucide-react';
import { JournalData, TOTAL_WEEKS, WeekStatus } from '../types/journal';

interface WeekGridProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModalForWeek?: (weekNum: number) => void;
}

export function WeekGrid({ journalData, selectedWeek, onSelectWeek }: WeekGridProps) {
  const [filter, setFilter] = useState<'all' | 'with_content' | 'completed' | 'empty'>('all');
  // Compact toggle: defaults to compact (küçük/şık) as requested by user
  const [isCompact, setIsCompact] = useState<boolean>(true);

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

  return (
    <section id="weeks-top-grid-section" className="py-4 sm:py-6 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header Bar with Title, Filters and View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded">
                  Haftalık Süreç Gezgini
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  30 Hafta
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Gelişim Süreci Haritası
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
                Tümü (30)
              </button>
              <button
                onClick={() => setFilter('with_content')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'with_content'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                İçerikli
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Biten
              </button>
              <button
                onClick={() => setFilter('empty')}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'empty'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Boş
              </button>
            </div>

            {/* Toggle Compact vs Detailed View */}
            <button
              onClick={() => setIsCompact(prev => !prev)}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs"
              title={isCompact ? 'Genişletilmiş görünüme geç' : 'Daha küçük / kompakt görünüme geç'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isCompact ? 'Kompakt (Yer Kaplamayan)' : 'Kart Görünümü'}</span>
              {isCompact ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 1. COMPACT VIEW (Very space-efficient, tiny chips grid) */}
        {isCompact ? (
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-1.5 sm:gap-2">
            {filteredWeeks.map(weekNum => {
              const items = getWeekItems(weekNum);
              const itemCount = items.length;
              const status = getWeekStatus(weekNum);
              const isSelected = selectedWeek === weekNum;

              let dotColor = 'bg-slate-300 dark:bg-slate-600';
              if (status === 'completed') dotColor = 'bg-emerald-500';
              else if (status === 'in_progress' || itemCount > 0) dotColor = 'bg-amber-500';

              return (
                <button
                  key={weekNum}
                  onClick={() => onSelectWeek(weekNum)}
                  type="button"
                  title={`${weekNum}. Hafta (${itemCount > 0 ? `${itemCount} kayıt` : 'Boş'})`}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/30 scale-105 z-10'
                      : 'bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Status indicator dot at top-right */}
                  <span
                    className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white ring-1 ring-blue-400' : dotColor
                    }`}
                  />
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    Hafta
                  </span>
                  <span className="text-sm font-extrabold tabular-nums leading-none my-0.5">
                    {weekNum}
                  </span>
                  {itemCount > 0 && (
                    <span className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-white/90' : 'text-blue-600 dark:text-blue-400'}`}>
                      {itemCount} dosya
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* 2. EXPANDED VIEW (Traditional card grid, but tightened) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {filteredWeeks.map(weekNum => {
              const items = getWeekItems(weekNum);
              const itemCount = items.length;
              const status = getWeekStatus(weekNum);
              const isSelected = selectedWeek === weekNum;

              return (
                <div
                  key={weekNum}
                  onClick={() => onSelectWeek(weekNum)}
                  className={`group text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold tabular-nums ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {weekNum}. Hafta
                      </span>

                      {status === 'completed' ? (
                        <span
                          className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                          <span>Bitti</span>
                        </span>
                      ) : status === 'in_progress' || itemCount > 0 ? (
                        <span
                          className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span
                          className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/10 text-white/80' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <CircleDot className="w-2.5 h-2.5 mr-0.5 inline text-slate-400 shrink-0" />
                          <span>Boş</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px]">
                      {itemCount > 0 ? (
                        <span className={`font-semibold ${isSelected ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                          {itemCount} Yenilik ekli
                        </span>
                      ) : (
                        <span className={`italic ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                          İçerik yok
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`pt-1.5 mt-2 border-t flex items-center justify-between text-[10px] font-semibold ${
                      isSelected
                        ? 'border-white/20 text-white'
                        : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  >
                    <span>{isSelected ? 'Seçili' : 'Görüntüle'}</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
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
