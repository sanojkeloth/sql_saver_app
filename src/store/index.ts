// Global state management using Zustand
import { create } from 'zustand';
import { SQLQuery, Folder, User, SearchFilter } from '../types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Queries
  queries: SQLQuery[];
  setQueries: (queries: SQLQuery[]) => void;
  addQuery: (query: SQLQuery) => void;
  updateQuery: (id: string, updates: Partial<SQLQuery>) => void;
  deleteQuery: (id: string) => void;

  // Folders
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;

  // UI State
  currentView: 'all' | 'recent' | 'favorites' | 'folder' | 'team';
  setCurrentView: (view: AppState['currentView']) => void;

  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;

  selectedQueryId: string | null;
  setSelectedQueryId: (id: string | null) => void;

  searchFilter: SearchFilter;
  setSearchFilter: (filter: SearchFilter) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Modals
  showSaveQueryModal: boolean;
  setShowSaveQueryModal: (show: boolean) => void;

  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;

  pendingQuery: { query: string; source?: string } | null;
  setPendingQuery: (data: { query: string; source?: string } | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Queries
  queries: [],
  setQueries: (queries) => set({ queries }),
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  updateQuery: (id, updates) =>
    set((state) => ({
      queries: state.queries.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    })),
  deleteQuery: (id) =>
    set((state) => ({
      queries: state.queries.filter((q) => q.id !== id),
    })),

  // Folders
  folders: [],
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    })),

  // UI State
  currentView: 'all',
  setCurrentView: (view) => set({ currentView: view }),

  selectedFolderId: null,
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),

  selectedQueryId: null,
  setSelectedQueryId: (id) => set({ selectedQueryId: id }),

  searchFilter: {},
  setSearchFilter: (filter) => set({ searchFilter: filter }),

  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // Modals
  showSaveQueryModal: false,
  setShowSaveQueryModal: (show) => set({ showSaveQueryModal: show }),

  showShareModal: false,
  setShowShareModal: (show) => set({ showShareModal: show }),

  pendingQuery: null,
  setPendingQuery: (data) => set({ pendingQuery: data }),
}));
