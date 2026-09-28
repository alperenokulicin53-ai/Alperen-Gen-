import { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowDown } from 'lucide-react';
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
    <section className="bg-gradient-to-b from-blue-50/30 via-slate-50/40 to-white border-b border-slate-200/80 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Prominent Live Clock & Date */}
          <div className="flex flex-col gap-2">
            {/* Live Indicator Chip */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Canlı Sistem Saati &amp; Tarih
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Türkiye (Europe/Istanbul • GMT+3)
              </span>
            </div>

            {/* Big Clock Display */}
            <div className="flex items-baseline gap-3 sm:gap-4 my-1">
              <div className="flex items-center text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
                <span>{live.hours}</span>
                <span className="text-blue-500 animate-pulse mx-0.5 sm:mx-1">:</span>
                <span>{live.minutes}</span>
                <span className="text-blue-500 animate-pulse mx-0.5 sm:mx-1">:</span>
                <span className="text-blue-600 text-3xl sm:text-4xl lg:text-5xl">{live.seconds}</span>
              </div>
            </div>

            {/* Date Details */}
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{live.fullDateTurkish}</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                {live.dateStr}
              </span>
            </div>
          </div>

          {/* Right: Quick Context & Jump Affordance */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Odaklanılan Hafta
              </span>
              <span className="text-lg font-extrabold text-blue-700">
                {selectedWeek}. Hafta İçeriği
              </span>
            </div>

            <button
              onClick={onScrollToAllRecords}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Tüm 30 Haftanın Kayıtlarını Gör</span>
              <ArrowDown className="w-3.5 h-3.5 text-blue-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
