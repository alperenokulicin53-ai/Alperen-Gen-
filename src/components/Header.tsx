import React from 'react';
import { Download, Plus } from 'lucide-react';
import { JournalData } from '../types/journal';

interface HeaderProps {
  onOpenAddModal: () => void;
  journalData: JournalData;
}

export function Header({ onOpenAddModal, journalData }: HeaderProps) {
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(journalData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `alperen_genc_gelisim_gunlugu_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Alperen Genç
            </span>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              30 Hafta Gelişim Günlüğü
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Öğretmen İnceleme ve Haftalık Proje Dokümantasyonu
          </span>
        </div>

        {/* Center / Right: Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Quick Add Button in Header - Önemli Mavi Buton */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Yenilik Ekle</span>
          </button>

          {/* Backup Export */}
          <button
            onClick={handleExport}
            title="Günlüğü JSON olarak yedekle"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden lg:inline">Yedek İndir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
