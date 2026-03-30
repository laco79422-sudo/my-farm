import { create } from 'zustand';
import type { ShopItem } from '../types';

export interface CartLine {
  item: ShopItem;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (item: ShopItem) => void;
  remove: (itemId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  add: (item) => {
    const { lines } = get();
    const idx = lines.findIndex((l) => l.item.id === item.id);
    if (idx >= 0) {
      const next = [...lines];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      set({ lines: next });
    } else {
      set({ lines: [...lines, { item, qty: 1 }] });
    }
  },
  remove: (itemId) => set({ lines: get().lines.filter((l) => l.item.id !== itemId) }),
  clear: () => set({ lines: [] }),
}));
