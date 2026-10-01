import React, { useRef } from 'react';
import { Download, Upload, Plus, Sun, Moon, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { JournalData } from '../types/journal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import profileLogo from '../assets/images/ag_kodlama_logo_1790860803823.jpg';

interface HeaderProps {
  onOpenAddModal: () => void;
  journalData: JournalData;
  onImportData: (data: JournalData) => Promise<void>;
}

export function Header({ onOpenAddModal, journalData, onImportData }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, openLoginModal, logout } = useAuth();

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(journalData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `alperen_genc_gelisim_gunlugu_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && (parsed.items || parsed.weeks)) {
          await onImportData(parsed);
        } else {
          alert('Geçersiz dosya formatı.');
        }
      } catch {
        alert('Yedek dosyası okunurken hata oluştu.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Subtitle with Profile Photo on the Left */}
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <img
              src={profileLogo}
              alt="Alperen Genç - AG Kodlama Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs ring-2 ring-blue-500/10 group-hover:scale-105 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Alperen Genç
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                38 Hafta Gelişim Günlüğü
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              Öğretmen İnceleme ve Haftalık Proje Dokümantasyonu
            </span>
          </div>
        </div>

        {/* Center / Right: Theme Switcher & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık (Siyah) moda geç'}
            aria-label="Tema Değiştir"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-bold text-xs cursor-pointer transition-all shadow-xs ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 ring-2 ring-amber-400/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 ring-2 ring-slate-400/20'
            }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">Aydınlık</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Karanlık</span>
              </>
            )}
          </button>

          {/* Admin Panel Toggle / Login Status Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3 py-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                  Yönetici
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                  Alperen Genç
                </span>
              </div>
              <button
                onClick={logout}
                title="Yönetici oturumunu kapat"
                className="ml-1 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              title="Admin Girişi (Alperen Genç)"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Admin Girişi</span>
            </button>
          )}

          {/* Quick Add Button in Header (Admin only) */}
          {isAdmin ? (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Yenilik Ekle</span>
            </button>
          ) : null}

          {/* Backup Export */}
          <button
            onClick={handleExport}
            title="Günlüğü JSON olarak yedekle / indir"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">Yedek İndir</span>
          </button>

          {/* Backup Import (Admin only) */}
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Yedek dosyasını geri yükle"
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden lg:inline">Yedek Yükle</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
