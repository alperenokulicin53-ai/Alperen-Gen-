import { JournalData, WeekItem, WeekStatus, createInitialJournalData } from '../types/journal';

const CACHE_KEY = 'alperen_genc_journal_cache';

export function getLocalData(): JournalData {
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

export function saveLocalData(data: JournalData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage kaydetme hatası:', err);
  }
}

export async function loadJournalData(): Promise<JournalData> {
  const local = getLocalData();

  try {
    const res = await fetch('/api/journal', { cache: 'no-store' });
    if (res.ok) {
      const serverData: JournalData = await res.json();
      
      // If server has items or weeks, merge them
      const combinedItemMap = new Map<string, WeekItem>();
      
      // Local items first
      if (Array.isArray(local.items)) {
        local.items.forEach(it => combinedItemMap.set(it.id, it));
      }
      // Server items overwrite/join
      if (Array.isArray(serverData.items)) {
        serverData.items.forEach(it => combinedItemMap.set(it.id, it));
      }

      const mergedItems = Array.from(combinedItemMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const mergedWeeks = { ...serverData.weeks };
      if (local.weeks) {
        Object.keys(local.weeks).forEach(k => {
          const wNum = Number(k);
          if (local.weeks[wNum]?.status && local.weeks[wNum].status !== 'not_started') {
            mergedWeeks[wNum] = local.weeks[wNum];
          }
        });
      }

      const finalMerged: JournalData = {
        weeks: mergedWeeks,
        items: mergedItems,
        comments: serverData.comments || [],
      };

      saveLocalData(finalMerged);
      return finalMerged;
    }
  } catch (err) {
    console.warn('API servisine ulaşılamadı, yerel depolama kullanılıyor:', err);
  }

  return local;
}

export async function createItem(payload: {
  weekNumber: number;
  type: 'post' | 'drive';
  title: string;
  content: string;
  driveUrl?: string;
  formattedDate: string;
}): Promise<WeekItem> {
  let createdItem: WeekItem | null = null;

  // 1. First try creating on server so all devices get it immediately
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      createdItem = await res.json();
    }
  } catch (err) {
    console.warn('Sunucuya kaydedilemedi, yerel hafızaya kaydediliyor:', err);
  }

  // 2. If server request didn't return, build local fallback
  if (!createdItem) {
    createdItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      weekNumber: payload.weekNumber,
      type: payload.type,
      title: payload.title.trim(),
      content: payload.content.trim(),
      driveUrl: payload.driveUrl ? payload.driveUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
      formattedDate: payload.formattedDate,
    };
  }

  // Save to localStorage
  const current = getLocalData();
  const nextItems = [createdItem, ...current.items.filter(i => i.id !== createdItem?.id)];
  const nextWeeks = { ...current.weeks };
  if (nextWeeks[payload.weekNumber] && nextWeeks[payload.weekNumber].status === 'not_started') {
    nextWeeks[payload.weekNumber] = {
      ...nextWeeks[payload.weekNumber],
      status: 'in_progress',
    };
  }
  saveLocalData({ ...current, items: nextItems, weeks: nextWeeks });

  return createdItem;
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
    await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
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
    await fetch(`/api/weeks/${weekNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }
}

export async function importJournalData(data: JournalData): Promise<void> {
  saveLocalData(data);
  try {
    await fetch('/api/journal/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // ignore
  }
}
