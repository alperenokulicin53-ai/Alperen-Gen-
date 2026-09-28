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
  let serverData: JournalData | null = null;

  try {
    const res = await fetch('/api/journal', { cache: 'no-store' });
    if (res.ok) {
      serverData = await res.json();
    }
  } catch {
    // API not reachable
  }

  const local = getLocalData();

  if (serverData) {
    // Merge server and local data so nothing is ever lost on any device
    const combinedItemMap = new Map<string, WeekItem>();
    
    // Add local items
    local.items.forEach(it => combinedItemMap.set(it.id, it));
    // Add server items
    serverData.items.forEach(it => combinedItemMap.set(it.id, it));

    const mergedItems = Array.from(combinedItemMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const mergedWeeks = { ...serverData.weeks };
    Object.keys(local.weeks).forEach(k => {
      const wNum = Number(k);
      if (local.weeks[wNum]?.status === 'completed') {
        mergedWeeks[wNum] = local.weeks[wNum];
      }
    });

    const finalMerged: JournalData = {
      weeks: mergedWeeks,
      items: mergedItems,
      comments: serverData.comments || [],
    };

    saveLocalData(finalMerged);
    return finalMerged;
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
  // 1. Try sending to server first for cross-device persistence
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const createdItem: WeekItem = await res.json();
      const current = getLocalData();
      const nextItems = [createdItem, ...current.items.filter(i => i.id !== createdItem.id)];
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
  } catch (err) {
    console.warn('Server error on create, saving locally:', err);
  }

  // 2. Fallback to local storage if server is unavailable
  const fallbackItem: WeekItem = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    weekNumber: payload.weekNumber,
    type: payload.type,
    title: payload.title.trim(),
    content: payload.content.trim(),
    driveUrl: payload.driveUrl ? payload.driveUrl.trim() : undefined,
    createdAt: new Date().toISOString(),
    formattedDate: payload.formattedDate,
  };

  const current = getLocalData();
  const nextItems = [fallbackItem, ...current.items];
  const nextWeeks = { ...current.weeks };
  if (nextWeeks[payload.weekNumber] && nextWeeks[payload.weekNumber].status === 'not_started') {
    nextWeeks[payload.weekNumber] = {
      ...nextWeeks[payload.weekNumber],
      status: 'in_progress',
    };
  }
  saveLocalData({ ...current, items: nextItems, weeks: nextWeeks });

  return fallbackItem;
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
