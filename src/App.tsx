import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveTimeBanner } from './components/LiveTimeBanner';
import { Overview } from './components/Overview';
import { WeekGrid } from './components/WeekGrid';
import { WeekDetail } from './components/WeekDetail';
import { AllWeeksList } from './components/AllWeeksList';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  JournalData,
  WeekItem,
  WeekStatus,
  createInitialJournalData,
} from './types/journal';
import * as journalService from './services/journalService';

export default function App() {
  const [journalData, setJournalData] = useState<JournalData>(() => journalService.getLocalData());
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const saved = localStorage.getItem('alperen_selected_week');
    return saved ? Math.max(1, Math.min(30, parseInt(saved, 10))) : 1;
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

    // Real-time Firestore sync: updates automatically when phone/PC adds or edits
    const unsubscribe = journalService.subscribeToJournal(updatedData => {
      setJournalData(updatedData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save selected week to localStorage
  const handleSelectWeek = (weekNum: number) => {
    setSelectedWeek(weekNum);
    localStorage.setItem('alperen_selected_week', weekNum.toString());

    // Scroll smoothly to detail
    const el = document.getElementById('week-detail-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToAllRecords = () => {
    const el = document.getElementById('all-weeks-record-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
      } else if (e.key === 'ArrowRight' && selectedWeek < 30) {
        handleSelectWeek(selectedWeek + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWeek, isAddModalOpen, isEditModalOpen]);

  // Direct content actions - No admin login required!
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
      const created = await journalService.createItem(payload);
      setJournalData(prev => {
        const nextItems = [created, ...prev.items];
        const nextWeeks = { ...prev.weeks };
        if (nextWeeks[payload.weekNumber] && nextWeeks[payload.weekNumber].status === 'not_started') {
          nextWeeks[payload.weekNumber] = {
            ...nextWeeks[payload.weekNumber],
            status: 'in_progress',
          };
        }
        return {
          ...prev,
          items: nextItems,
          weeks: nextWeeks,
        };
      });
      setSelectedWeek(payload.weekNumber);
      localStorage.setItem('alperen_selected_week', payload.weekNumber.toString());

      addToast('success', `${payload.weekNumber}. Hafta için yenilik kaydedildi.`);
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Kaydedilirken bir hata oluştu');
      throw err;
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
        items: prev.items.map(it =>
          it.id === id
            ? {
                ...it,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : it
        ),
      }));
      addToast('success', 'Yenilik başarıyla güncellendi.');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Güncelleme başarısız oldu');
      throw err;
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const itemToDelete = journalData.items.find(it => it.id === id);
      await journalService.deleteItem(id);
      setJournalData(prev => {
        const nextItems = prev.items.filter(it => it.id !== id);
        const nextWeeks = { ...prev.weeks };
        if (itemToDelete) {
          const remainingInWeek = nextItems.filter(it => it.weekNumber === itemToDelete.weekNumber);
          if (remainingInWeek.length === 0 && nextWeeks[itemToDelete.weekNumber]?.status === 'in_progress') {
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
            weekNumber: weekNum,
            status,
          },
        },
      }));
      addToast('success', `${weekNum}. Hafta durumu güncellendi.`);
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Hafta güncellenirken hata oluştu');
    }
  };

  const handleImportData = async (data: JournalData) => {
    try {
      await journalService.importJournalData(data);
      setJournalData(data);
      addToast('success', 'Yedek başarıyla yüklendi ve güncellendi.');
    } catch (err: unknown) {
      addToast('error', 'Yedek yüklenirken hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Header with Blue + Yenilik Ekle button */}
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

        {/* 1. ÜST KISIM: 30 Hafta Grid Gezgini */}
        <WeekGrid
          journalData={journalData}
          selectedWeek={selectedWeek}
          onSelectWeek={handleSelectWeek}
          onOpenAddModalForWeek={handleOpenAddModal}
        />

        {/* 2. AKTİF SEÇİLİ HAFTA DETAYI */}
        <WeekDetail
          weekNumber={selectedWeek}
          journalData={journalData}
          onSelectWeek={handleSelectWeek}
          onOpenAddModal={() => handleOpenAddModal(selectedWeek)}
          onOpenEditModal={handleOpenEditModal}
          onDeleteItem={handleDeleteItem}
          onUpdateWeekStatus={handleUpdateWeekStatus}
          onScrollToBottomWeeks={handleScrollToAllRecords}
        />

        {/* 3. ALT KISIM: 30 Haftanın Tüm Gelişim Kayıtları */}
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
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800">
            Alperen Genç — Haftalık Gelişim Günlüğü
          </div>
          <div className="text-slate-500">
            30 Haftalık Kişisel Proje ve Çalışma Süreci Dokümantasyonu
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

      {/* Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
