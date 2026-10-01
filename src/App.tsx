import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveTimeBanner } from './components/LiveTimeBanner';
import { Overview } from './components/Overview';
import { WeekGrid } from './components/WeekGrid';
import { WeekDetail } from './components/WeekDetail';
import { AllWeeksList } from './components/AllWeeksList';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AIChatWidget } from './components/AIChatWidget';
import {
  JournalData,
  WeekItem,
  WeekStatus,
} from './types/journal';
import * as journalService from './services/journalService';

export default function App() {
  const [journalData, setJournalData] = useState<JournalData>(() => journalService.getLocalData());
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const saved = localStorage.getItem('alperen_selected_week');
    return saved ? Math.max(1, Math.min(38, parseInt(saved, 10))) : 1;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalWeek, setAddModalWeek] = useState<number>(selectedWeek);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeekItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load initial data and subscribe to real-time changes
  useEffect(() => {
    async function init() {
      try {
        const data = await journalService.loadJournalData();
        setJournalData(data);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }
    init();

    const unsubscribe = journalService.subscribeToJournal(updatedData => {
      setJournalData(updatedData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Save selected week to localStorage
  const handleSelectWeek = (weekNum: number) => {
    setSelectedWeek(weekNum);
    localStorage.setItem('alperen_selected_week', String(weekNum));

    const element = document.getElementById('week-detail-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToAllRecords = () => {
    const el = document.getElementById('all-weeks-record-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keyboard navigation for previous/next week
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isAddModalOpen ||
        isEditModalOpen ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && selectedWeek > 1) {
        handleSelectWeek(selectedWeek - 1);
      } else if (e.key === 'ArrowRight' && selectedWeek < 38) {
        handleSelectWeek(selectedWeek + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWeek, isAddModalOpen, isEditModalOpen]);

  // Direct content actions
  const handleOpenAddModal = (targetWeekNum?: number) => {
    setAddModalWeek(targetWeekNum || selectedWeek);
    setIsAddModalOpen(true);
  };

  const handleAddItem = async (payload: {
    weekNumber: number;
    type: 'post' | 'drive';
    title: string;
    content: string;
    driveUrl?: string;
    formattedDate: string;
  }) => {
    try {
      const newItem = await journalService.createItem(payload);
      setJournalData(prev => ({
        ...prev,
        items: [newItem, ...prev.items.filter(i => i.id !== newItem.id)],
        weeks: {
          ...prev.weeks,
          [payload.weekNumber]: {
            ...prev.weeks[payload.weekNumber],
            weekNumber: payload.weekNumber,
            status:
              prev.weeks[payload.weekNumber]?.status === 'completed'
                ? 'completed'
                : 'in_progress',
          },
        },
      }));

      setSelectedWeek(payload.weekNumber);
      setIsAddModalOpen(false);
      addToast('success', `${payload.weekNumber}. Haftaya yeni kayıt başarıyla eklendi!`);
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Eklenirken hata oluştu');
    }
  };

  const handleOpenEditModal = (item: WeekItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (
    id: string,
    payload: { title?: string; content?: string; driveUrl?: string }
  ) => {
    try {
      await journalService.updateItem(id, payload);
      setJournalData(prev => ({
        ...prev,
        items: prev.items.map(it => (it.id === id ? { ...it, ...payload } : it)),
      }));
      setIsEditModalOpen(false);
      setEditingItem(null);
      addToast('success', 'Kayıt başarıyla güncellendi.');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Güncellenirken hata oluştu');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await journalService.deleteItem(id);
      setJournalData(prev => {
        const itemToDelete = prev.items.find(it => it.id === id);
        const nextItems = prev.items.filter(it => it.id !== id);
        const nextWeeks = { ...prev.weeks };

        if (itemToDelete) {
          const remaining = nextItems.filter(it => it.weekNumber === itemToDelete.weekNumber);
          if (remaining.length === 0 && nextWeeks[itemToDelete.weekNumber]?.status === 'in_progress') {
            nextWeeks[itemToDelete.weekNumber] = {
              ...nextWeeks[itemToDelete.weekNumber],
              status: 'not_started',
            };
          }
        }
        return {
          ...prev,
          items: nextItems,
          weeks: nextWeeks,
        };
      });
      addToast('success', 'Kayıt silindi.');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Silinirken hata oluştu');
    }
  };

  const handleUpdateWeekStatus = async (
    weekNum: number,
    status: WeekStatus
  ) => {
    try {
      await journalService.updateWeekMeta(weekNum, { status });
      setJournalData(prev => ({
        ...prev,
        weeks: {
          ...prev.weeks,
          [weekNum]: {
            ...prev.weeks[weekNum],
            weekNumber: weekNum,
            status,
          },
        },
      }));
      addToast(
        'success',
        status === 'completed'
          ? `${weekNum}. Hafta 'Yapıldı (Onaylı)' olarak güncellendi.`
          : `${weekNum}. Hafta 'Yapılmadı' durumuna alındı.`
      );
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Hafta güncellenirken hata oluştu');
    }
  };

  const handleAddComment = async (payload: {
    weekNumber: number;
    authorName: string;
    content: string;
  }) => {
    try {
      const newComment = await journalService.addComment(payload);
      setJournalData(prev => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
      }));
      addToast('success', 'Yorumunuz başarıyla yayınlandı!');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Yorum eklenirken hata oluştu');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await journalService.deleteComment(id);
      setJournalData(prev => ({
        ...prev,
        comments: (prev.comments || []).filter(c => c.id !== id),
      }));
      addToast('info', 'Yorum silindi.');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Yorum silinirken hata oluştu');
    }
  };

  const handleImportData = async (data: JournalData) => {
    try {
      await journalService.importJournalData(data);
      setJournalData(data);
      addToast('success', 'Yedek başarıyla yüklendi ve güncellendi.');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Yedek yüklenirken hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors">
      {/* Top Bar Header with Theme toggle & Admin panel */}
      <Header
        onOpenAddModal={() => handleOpenAddModal(selectedWeek)}
        journalData={journalData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Prominent Large Live Time & Date Banner at the very top */}
        <LiveTimeBanner
          selectedWeek={selectedWeek}
          onScrollToAllRecords={handleScrollToAllRecords}
        />

        {/* Overview Stats */}
        <Overview journalData={journalData} />

        {/* 1. ÜST KISIM: 38 Hafta Gelişim Süreci Haritası (Büyük ve Yapıldı/Yapılmadı butonlu) */}
        <WeekGrid
          journalData={journalData}
          selectedWeek={selectedWeek}
          onSelectWeek={handleSelectWeek}
          onUpdateWeekStatus={handleUpdateWeekStatus}
          onOpenAddModalForWeek={handleOpenAddModal}
        />

        {/* 2. AKTİF SEÇİLİ HAFTA DETAYI VE YORUM BÖLÜMÜ */}
        <WeekDetail
          weekNumber={selectedWeek}
          journalData={journalData}
          onSelectWeek={handleSelectWeek}
          onOpenAddModal={() => handleOpenAddModal(selectedWeek)}
          onOpenEditModal={handleOpenEditModal}
          onDeleteItem={handleDeleteItem}
          onUpdateWeekStatus={handleUpdateWeekStatus}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />

        {/* 3. ALT KISIM: 38 Haftanın Tüm Gelişim Kayıtları */}
        <AllWeeksList
          journalData={journalData}
          selectedWeek={selectedWeek}
          onSelectWeek={handleSelectWeek}
          onOpenAddModalForWeek={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onDeleteItem={handleDeleteItem}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            Alperen Genç — Haftalık Gelişim Günlüğü
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            38 Haftalık Kişisel Proje ve Çalışma Süreci Dokümantasyonu
          </div>
        </div>
      </footer>

      {/* Direct Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        weekNumber={addModalWeek}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onUpdate={handleUpdateItem}
      />

      {/* Admin Login Modal (Alperen Genç / anzerli5331) */}
      <AdminLoginModal />

      {/* Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Floating AG Yapay Zekası Chatbot */}
      <AIChatWidget />
    </div>
  );
}
