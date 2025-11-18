import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Folder as FolderIcon,
  FolderPlus,
  Grid,
  List,
  Clock,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SaveQueryModal } from '../components/SaveQueryModal';
import { QueryCard } from '../components/QueryCard';
import { useStore } from '../store';
import { dbHelpers } from '../db';
import { SQLQuery } from '../types';

export function SidePanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedQueryForEdit, setSelectedQueryForEdit] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const queries = useStore((state) => state.queries);
  const folders = useStore((state) => state.folders);
  const selectedFolderId = useStore((state) => state.selectedFolderId);
  const currentView = useStore((state) => state.currentView);

  const setQueries = useStore((state) => state.setQueries);
  const setFolders = useStore((state) => state.setFolders);
  const setSelectedFolderId = useStore((state) => state.setSelectedFolderId);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const addFolder = useStore((state) => state.addFolder);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQueries();
  }, [currentView, selectedFolderId, searchQuery]);

  const loadData = async () => {
    const allQueries = await dbHelpers.searchQueries('');
    const allFolders = await dbHelpers.getAllFolders();
    setQueries(allQueries);
    setFolders(allFolders);
  };

  const filterQueries = async () => {
    let filtered: SQLQuery[] = [];

    if (searchQuery.trim()) {
      filtered = await dbHelpers.searchQueries(searchQuery);
    } else if (currentView === 'recent') {
      filtered = await dbHelpers.getRecentQueries(20);
    } else if (currentView === 'folder' && selectedFolderId) {
      filtered = await dbHelpers.getQueriesByFolder(selectedFolderId);
    } else {
      filtered = await dbHelpers.searchQueries('');
    }

    setQueries(filtered);
  };

  const handleCopyQuery = async (query: SQLQuery) => {
    await navigator.clipboard.writeText(query.query);
    await dbHelpers.incrementUsageCount(query.id);
    await loadData();

    // Send message to content script to show notification
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'COPY_TO_CLIPBOARD',
          data: { text: query.query },
        });
      }
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const id = await dbHelpers.createFolder({
      name: newFolderName,
      visibility: 'private',
      createdBy: 'current-user',
    });

    const folder = await dbHelpers.getFolder(id);
    if (folder) {
      addFolder(folder);
    }

    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const handleDeleteQuery = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      await dbHelpers.deleteQuery(id);
      await loadData();
    }
  };

  return (
    <div className="w-full h-screen bg-white dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">SQL Saver</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView('all');
                setSelectedFolderId(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === 'all'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Queries
              <span className="ml-auto text-xs">{queries.length}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('recent');
                setSelectedFolderId(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === 'recent'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === 'favorites'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>

            <button
              onClick={() => setCurrentView('team')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === 'team'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Team
            </button>
          </div>

          {/* Folders */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Folders
              </h3>
              <button
                onClick={() => setShowNewFolderDialog(true)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {showNewFolderDialog && (
              <div className="px-3 mb-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') setShowNewFolderDialog(false);
                  }}
                  placeholder="Folder name"
                  className="text-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentView('folder');
                    setSelectedFolderId(folder.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FolderIcon className="w-4 h-4" />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>

              <Button onClick={() => setShowSaveModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Query
              </Button>
            </div>
          </div>
        </div>

        {/* Query Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {queries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 dark:text-slate-600 mb-4">
                <Search className="w-16 h-16 mx-auto mb-2" />
                <p className="text-lg font-medium">No queries found</p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Get started by saving your first query'}
                </p>
              </div>
              {!searchQuery && (
                <Button variant="primary" onClick={() => setShowSaveModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Your First Query
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-2'
              }
            >
              {queries.map((query) => (
                <QueryCard
                  key={query.id}
                  query={query}
                  onCopy={() => handleCopyQuery(query)}
                  onEdit={() => {
                    setSelectedQueryForEdit(query.id);
                    setShowSaveModal(true);
                  }}
                  onShare={() => {
                    // TODO: Implement share
                    alert('Share functionality coming soon!');
                  }}
                  onDelete={() => handleDeleteQuery(query.id)}
                  onClick={() => {
                    // TODO: Open query details
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Query Modal */}
      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setSelectedQueryForEdit(null);
          loadData();
        }}
        queryId={selectedQueryForEdit || undefined}
      />
    </div>
  );
}
