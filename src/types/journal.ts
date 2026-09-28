export type WeekStatus = 'not_started' | 'in_progress' | 'completed';

export interface WeekItem {
  id: string;
  weekNumber: number; // 1 to 30
  type: 'post' | 'drive';
  title: string;
  content: string; // Long text for post, or description for drive link
  driveUrl?: string; // Validated Google Drive URL
  createdAt: string; // ISO date string
  formattedDate: string; // e.g. "28.09.2026 – 19:30"
  updatedAt?: string;
}

export interface WeekComment {
  id: string;
  weekNumber: number; // 1 to 30
  authorName: string;
  content: string;
  createdAt: string;
  formattedDate: string; // e.g. "28.09.2026 – 19:35"
}

export interface WeekMeta {
  weekNumber: number;
  customTitle?: string;
  status: WeekStatus;
}

export interface JournalData {
  weeks: Record<number, WeekMeta>;
  items: WeekItem[];
  comments: WeekComment[];
}

export const TOTAL_WEEKS = 30;

export function createInitialJournalData(): JournalData {
  const weeks: Record<number, WeekMeta> = {};
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    weeks[i] = {
      weekNumber: i,
      status: 'not_started',
    };
  }
  return {
    weeks,
    items: [],
    comments: [],
  };
}
