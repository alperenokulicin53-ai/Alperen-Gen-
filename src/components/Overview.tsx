import { CheckCircle2, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { JournalData, TOTAL_WEEKS } from '../types/journal';

interface OverviewProps {
  journalData: JournalData;
}

export function Overview({ journalData }: OverviewProps) {
  const weeksWithItemsCount = new Set(journalData.items.map(item => item.weekNumber)).size;
  
  let completedWeeksCount = 0;
  Object.values(journalData.weeks).forEach(w => {
    if (w.status === 'completed') completedWeeksCount++;
  });

  const progressPercent = Math.round((completedWeeksCount / TOTAL_WEEKS) * 100);

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 sm:py-5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Toplam Hafta */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Süreç
              </span>
              <CalendarDays className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {TOTAL_WEEKS}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Planlanan gelişim haftası</p>
            </div>
          </div>

          {/* Card 2: İçerik Eklenen Hafta Sayısı */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                İçerik Eklenen
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {weeksWithItemsCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {TOTAL_WEEKS}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {journalData.items.length} toplam yenilik &amp; kayıt
              </p>
            </div>
          </div>

          {/* Card 3: Tamamlanan Hafta Sayısı */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tamamlanan
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {completedWeeksCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {TOTAL_WEEKS}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tamamlandı olarak işaretlenen</p>
            </div>
          </div>

          {/* Card 4: Genel İlerleme Yüzdesi */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Genel İlerleme
              </span>
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                %{progressPercent}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
