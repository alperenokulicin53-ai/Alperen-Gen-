import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, CircleDot, FileText, Link2 } from 'lucide-react';
import { JournalData, TOTAL_WEEKS, WeekStatus } from '../types/journal';

interface WeekGridProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModalForWeek?: (weekNum: number) => void;
}

export function WeekGrid({ journalData, selectedWeek, onSelectWeek }: WeekGridProps) {
  const [filter, setFilter] = useState<'all' | 'with_content' | 'completed' | 'empty'>('all');

  const getWeekItems = (weekNum: number) => {
    return journalData.items
      .filter(item => item.weekNumber === weekNum)
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
    <section id="weeks-top-grid-section" className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title & Filter Segmented Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Haftalık Süreç Gezgini
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                1'den 30'a Tüm Haftalar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              30 Haftalık Gelişim Süreci
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Haftayı seçerek doğrudan detay alanını görüntüleyebilir ve çalışmalarınızı inceleyebilirsiniz.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({TOTAL_WEEKS})
            </button>
            <button
              onClick={() => setFilter('with_content')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'with_content'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              İçerik Eklenenler
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tamamlananlar
            </button>
            <button
              onClick={() => setFilter('empty')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'empty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Henüz Boş
            </button>
          </div>
        </div>

        {/* 30 Weeks Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {filteredWeeks.map(weekNum => {
            const items = getWeekItems(weekNum);
            const itemCount = items.length;
            const status = getWeekStatus(weekNum);
            const isSelected = selectedWeek === weekNum;

            return (
              <div
                key={weekNum}
                onClick={() => onSelectWeek(weekNum)}
                className={`group text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-900 shadow-2xs'
                }`}
              >
                {/* Header: Week number & Status Indicator */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm sm:text-base font-bold tabular-nums ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {weekNum}. Hafta
                    </span>

                    {status === 'completed' ? (
                      <span
                        title="Tamamlandı"
                        className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-0.5 inline shrink-0" />
                        <span>Bitti</span>
                      </span>
                    ) : status === 'in_progress' || itemCount > 0 ? (
                      <span
                        title="Devam Ediyor"
                        className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-0.5 inline shrink-0" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span
                        title="İçerik Eklenmemiş"
                        className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <CircleDot className="w-3 h-3 mr-0.5 inline text-slate-400 shrink-0" />
                        <span>Boş</span>
                      </span>
                    )}
                  </div>

                  <div className="my-1.5 text-[11px]">
                    {itemCount > 0 ? (
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-blue-100' : 'text-blue-700'
                        }`}
                      >
                        {itemCount} Yenilik ekli
                      </span>
                    ) : (
                      <span
                        className={`italic ${
                          isSelected ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        İçerik eklenmedi
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom link affordance */}
                <div
                  className={`pt-2 mt-1 border-t flex items-center justify-between text-[11px] font-semibold ${
                    isSelected
                      ? 'border-white/20 text-white'
                      : 'border-slate-100 text-slate-600 group-hover:text-blue-700'
                  }`}
                >
                  <span>{isSelected ? 'Seçili' : 'Haftaya Git'}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-700'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
