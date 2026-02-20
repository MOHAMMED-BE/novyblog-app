import { create } from 'zustand';

export type ArticlesNavState = {
    categoryName?: string;
};

type ArticlesNavStore = {
    pending: ArticlesNavState | null;
    setPending: (state: ArticlesNavState) => void;
    clearPending: () => void;
    consumePending: () => ArticlesNavState | null;
};

export const useArticlesNavStore = create<ArticlesNavStore>((set, get) => ({
    pending: null,

    setPending: (state) => set({ pending: state }),
    clearPending: () => set({ pending: null }),

    consumePending: () => {
        const current = get().pending;
        set({ pending: null });
        return current;
    },
}));