import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getTurkeyLiveDateTime, TurkeyTimeDetails } from '../utils/date';

interface LiveTimeBannerProps {
  selectedWeek: number;
  onScrollToAllRecords: () => void;
}

export function LiveTimeBanner({ selectedWeek, onScrollToAllRecords }: LiveTimeBannerProps) {
  const [live, setLive] = useState<TurkeyTimeDetails>(getTurkeyLiveDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setLive(getTurkeyLiveDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-b from-blue-50/40 via-slate-50/20 to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent border-b border-slate-200 dark:border-slate-800 py-4 sm:py-5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          {/* Left: Prominent Live Clock & Date */}
          <div className="flex flex-col gap-1.5">
            {/* Live Indicator Chip */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Canlı Sistem Saati &amp; Tarih
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded">
                Türkiye (GMT+3)
              </span>
            </div>

            {/* Big Clock Display */}
            <div className="flex items-baseline gap-2 sm:gap-3 my-0.5">
              <div className="flex items-center text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
                <span>{live.hours}</span>
                <span className="text-blue-500 animate-pulse mx-0.5">:</span>
                <span>{live.minutes}</span>
                <span className="text-blue-500 animate-pulse mx-0.5">:</span>
                <span className="text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl lg:text-4xl">{live.seconds}</span>
              </div>
            </div>

            {/* Date Details */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{live.fullDateTurkish}</span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                {live.dateStr}
              </span>
            </div>
          </div>

          {/* Right: Quick Context Information */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                Şu An Seçili Olan
              </span>
              <span className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">
                {selectedWeek}. Hafta
              </span>
            </div>

            <button
              onClick={onScrollToAllRecords}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 text-center"
            >
              Tüm Kayıtları Gör ↓
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
