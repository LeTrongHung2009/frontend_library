import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useLibraryStore = create((set) => ({
  libraryCode: Cookies.get('libraryCode') || null,
  setLibraryCode: (code) => {
    Cookies.set('libraryCode', code, { expires: 365 });
    set({ libraryCode: code });
  },
  books: [],
  setBooks: (books) => set({ books }),
}));