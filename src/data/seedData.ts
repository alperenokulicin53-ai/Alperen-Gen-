import { JournalData, WeekItem, WeekStatus, createInitialJournalData } from '../types/journal';

// Built-in initial items that are compiled directly into the application
// Any items you add through AI Studio or chat can be permanently saved here
export const INITIAL_JOURNAL_ITEMS: WeekItem[] = [
  {
    id: "item_initial_week1_drive",
    weekNumber: 1,
    type: "drive",
    title: "Proje 1",
    content: "Google Drive bağlantısı",
    driveUrl: "https://drive.google.com/drive/my-drive?hl=tr",
    createdAt: "2026-09-28T20:07:25.615Z",
    formattedDate: "28.09.2026 – 23:07"
  }
];

export function getInitialSeedData(): JournalData {
  const base = createInitialJournalData();
  base.items = [...INITIAL_JOURNAL_ITEMS];
  
  // Set week status according to initial items
  INITIAL_JOURNAL_ITEMS.forEach(it => {
    if (base.weeks[it.weekNumber]) {
      base.weeks[it.weekNumber].status = 'in_progress';
    }
  });

  return base;
}
