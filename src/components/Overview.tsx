import { CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { JournalData, TOTAL_WEEKS } from '../types/journal';

interface OverviewProps {
  journalData: JournalData;
}

export function Overview({ journalData }: OverviewProps) {
  // Calculate stats
  const weeksWithItemsCount = new Set(journalData.items.map(item => item.weekNumber)).size;
  
  let completedWeeksCount = 0;
  Object.values(journalData.weeks).forEach(w => {
    if (w.status === 'completed') completedWeeksCount++;
  });

  const progressPercent = Math.round((completedWeeksCount / TOTAL_WEEKS) * 100);

  return (
    <section className="bg-white border-b border-slate-200/80 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Toplam Hafta */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Toplam Süreç
              </span>
              <CalendarDays className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {TOTAL_WEEKS}
              </div>
              <p className="text-xs text-slate-500 mt-1">Planlanan gelişim haftası</p>
            </div>
          </div>

          {/* Card 2: İçerik Eklenen Hafta Sayısı */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                İçerik Eklenen
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {weeksWithItemsCount} <span className="text-sm font-normal text-slate-400">/ {TOTAL_WEEKS}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {journalData.items.length} toplam yenilik &amp; kayıt
              </p>
            </div>
          </div>

          {/* Card 3: Tamamlanan Hafta Sayısı */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tamamlanan
              </span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {completedWeeksCount} <span className="text-sm font-normal text-slate-400">/ {TOTAL_WEEKS}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Nihayete eren haftalar</p>
            </div>
          </div>

          {/* Card 4: Genel İlerleme */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Genel İlerleme
              </span>
              <span className="text-xs font-bold text-slate-700 tabular-nums">%{progressPercent}</span>
            </div>
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden my-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {completedWeeksCount === TOTAL_WEEKS ? 'Tüm süreç tamamlandı' : `${TOTAL_WEEKS - completedWeeksCount} hafta kaldı`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
