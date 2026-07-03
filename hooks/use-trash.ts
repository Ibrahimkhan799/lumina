import { create } from "zustand";

type TrashStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useTrash = create<TrashStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
