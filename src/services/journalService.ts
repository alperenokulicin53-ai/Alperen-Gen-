import { JournalData, WeekItem, WeekComment, WeekStatus, createInitialJournalData } from '../types/journal';

const CACHE_KEY = 'alperen_genc_journal_cache';

export async function loadJournalData(): Promise<JournalData> {
  try {
    const res = await fetch('/api/journal');
    if (res.ok) {
      const data: JournalData = await res.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('API error, falling back to local storage cache:', err);
  }

  // Fallback to local storage
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  return createInitialJournalData();
}

export async function createItem(payload: {
  weekNumber: number;
  type: 'post' | 'drive';
  title: string;
  content: string;
  driveUrl?: string;
  formattedDate: string;
}): Promise<WeekItem> {
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Yenilik eklenirken bir hata oluştu');
    }
    const created: WeekItem = await res.json();
    return created;
  } catch (err) {
    // Client-side fallback if server fails
    console.error('Failed to create item on server:', err);
    const fallbackItem: WeekItem = {
      id: 'local_' + Date.now(),
      weekNumber: payload.weekNumber,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      driveUrl: payload.driveUrl,
      createdAt: new Date().toISOString(),
      formattedDate: payload.formattedDate,
    };
    return fallbackItem;
  }
}

export async function updateItem(
  id: string,
  payload: { title?: string; content?: string; driveUrl?: string }
): Promise<void> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Yenilik güncellenirken hata oluştu');
  }
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Yenilik silinirken hata oluştu');
  }
}

export async function updateWeekMeta(
  weekNumber: number,
  payload: { status?: WeekStatus; customTitle?: string }
): Promise<void> {
  const res = await fetch(`/api/weeks/${weekNumber}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Hafta güncellenirken hata oluştu');
  }
}

export async function createComment(payload: {
  weekNumber: number;
  authorName: string;
  content: string;
  formattedDate: string;
}): Promise<WeekComment> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Yorum eklenirken hata oluştu');
  }
  return await res.json();
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`/api/comments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Yorum silinirken hata oluştu');
  }
}

export async function importJournalData(data: JournalData): Promise<void> {
  const res = await fetch('/api/journal/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Veri yüklenirken hata oluştu');
  }
}
