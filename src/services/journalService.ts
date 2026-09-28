import { JournalData, WeekItem, WeekStatus, createInitialJournalData } from '../types/journal';

const CACHE_KEY = 'alperen_genc_journal_cache';

function getLocalData(): JournalData {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.weeks && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage okuma hatası:', err);
  }
  return createInitialJournalData();
}

function saveLocalData(data: JournalData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage kaydetme hatası:', err);
  }
}

export async function loadJournalData(): Promise<JournalData> {
  // First attempt backend API (works when deployed with server or in fullstack)
  try {
    const res = await fetch('/api/journal');
    if (res.ok) {
      const data: JournalData = await res.json();
      saveLocalData(data);
      return data;
    }
  } catch (err) {
    console.info('API servisine erişilemedi, yerel kalıcı hafızadan okunuyor.');
  }

  // Guaranteed fallback to localStorage
  return getLocalData();
}

export async function createItem(payload: {
  weekNumber: number;
  type: 'post' | 'drive';
  title: string;
  content: string;
  driveUrl?: string;
  formattedDate: string;
}): Promise<WeekItem> {
  const newItem: WeekItem = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    weekNumber: payload.weekNumber,
    type: payload.type,
    title: payload.title.trim(),
    content: payload.content.trim(),
    driveUrl: payload.driveUrl ? payload.driveUrl.trim() : undefined,
    createdAt: new Date().toISOString(),
    formattedDate: payload.formattedDate,
  };

  // Always persist locally
  const current = getLocalData();
  const nextItems = [newItem, ...current.items];
  const nextWeeks = { ...current.weeks };
  if (nextWeeks[payload.weekNumber] && nextWeeks[payload.weekNumber].status === 'not_started') {
    nextWeeks[payload.weekNumber] = {
      ...nextWeeks[payload.weekNumber],
      status: 'in_progress',
    };
  }
  const updated: JournalData = {
    ...current,
    items: nextItems,
    weeks: nextWeeks,
  };
  saveLocalData(updated);

  // Background sync with API if available
  try {
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // ignore
  }

  return newItem;
}

export async function updateItem(
  id: string,
  payload: { title?: string; content?: string; driveUrl?: string }
): Promise<void> {
  const current = getLocalData();
  const nextItems = current.items.map(it =>
    it.id === id
      ? {
          ...it,
          title: payload.title !== undefined ? payload.title.trim() : it.title,
          content: payload.content !== undefined ? payload.content.trim() : it.content,
          driveUrl: payload.driveUrl !== undefined ? payload.driveUrl.trim() : it.driveUrl,
          updatedAt: new Date().toISOString(),
        }
      : it
  );
  saveLocalData({ ...current, items: nextItems });

  try {
    fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function deleteItem(id: string): Promise<void> {
  const current = getLocalData();
  const itemToDelete = current.items.find(it => it.id === id);
  const nextItems = current.items.filter(it => it.id !== id);
  const nextWeeks = { ...current.weeks };

  if (itemToDelete) {
    const remainingInWeek = nextItems.filter(it => it.weekNumber === itemToDelete.weekNumber);
    if (remainingInWeek.length === 0 && nextWeeks[itemToDelete.weekNumber]?.status === 'in_progress') {
      nextWeeks[itemToDelete.weekNumber] = {
        ...nextWeeks[itemToDelete.weekNumber],
        status: 'not_started',
      };
    }
  }

  saveLocalData({ ...current, items: nextItems, weeks: nextWeeks });

  try {
    fetch(`/api/items/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function updateWeekMeta(
  weekNumber: number,
  payload: { status?: WeekStatus; customTitle?: string }
): Promise<void> {
  const current = getLocalData();
  const nextWeeks = {
    ...current.weeks,
    [weekNumber]: {
      ...current.weeks[weekNumber],
      weekNumber,
      status: payload.status || current.weeks[weekNumber]?.status || 'not_started',
      customTitle: payload.customTitle !== undefined ? payload.customTitle : current.weeks[weekNumber]?.customTitle,
    },
  };
  saveLocalData({ ...current, weeks: nextWeeks });

  try {
    fetch(`/api/weeks/${weekNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function importJournalData(data: JournalData): Promise<void> {
  saveLocalData(data);
  try {
    fetch('/api/journal/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch {
    // ignore
  }
}
