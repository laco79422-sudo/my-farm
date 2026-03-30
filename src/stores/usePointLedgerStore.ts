import { create } from 'zustand';

/** localStorage 원장 저장 후 UI(헤더·포인트 페이지) 갱신용 */
export const usePointLedgerStore = create<{
  rev: number;
  bump: () => void;
}>((set) => ({
  rev: 0,
  bump: () => set((s) => ({ rev: s.rev + 1 })),
}));
