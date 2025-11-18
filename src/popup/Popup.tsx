import { useEffect, useState } from 'react';
import { Search, Plus, Library, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SaveQueryModal } from '../components/SaveQueryModal';
import { QueryCard } from '../components/QueryCard';
import { useStore } from '../store';
import { dbHelpers } from '../db';
import { SQLQuery } from '../types';

export function Popup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentQueries, setRecentQueries] = useState<SQLQuery[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<{ query: string; source?: string } | null>(null);

  const queries = useStore((state) => state.queries);
  const setQueries = useStore((state) => state.setQueries);

  useEffect(() => {
    // Load recent queries
    loadRecentQueries();

    // Load all queries
    loadAllQueries();

    // Listen for messages from background/content scripts
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SAVE_QUERY') {
        setPendingQuery(message.data);
        setShowSaveModal(true);
      }
    });
  }, []);

  const loadRecentQueries = async () => {
    const recent = await dbHelpers.getRecentQueries(5);
    setRecentQueries(recent);
  };

  const loadAllQueries = async () => {
    const allQueries = await dbHelpers.searchQueries('');
    setQueries(allQueries);
  };

  const handleCopyQuery = async (query: SQLQuery) => {
    await navigator.clipboard.writeText(query.query);
    await dbHelpers.incrementUsageCount(query.id);
    loadRecentQueries();
  };

  const handleOpenLibrary = async () => {
    // Get current tab and open side panel
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close(); // Close popup after opening side panel
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await dbHelpers.searchQueries(searchQuery);
      setQueries(results);
      handleOpenLibrary();
    }
  };

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            SQL Saver
          </h1>
          <button
            onClick={handleOpenLibrary}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Open Library"
          >
            <Library className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Search queries..."
            className="flex-1"
          />
          <Button variant="primary" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Quick Actions
          </h2>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setShowSaveModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Save New Query
          </Button>
        </div>

        {/* Recent Queries */}
        {recentQueries.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Recent Queries
            </h2>
            <div className="space-y-2">
              {recentQueries.map((query) => (
                <QueryCard
                  key={query.id}
                  query={query}
                  onCopy={() => handleCopyQuery(query)}
                  onEdit={() => {
                    // TODO: Implement edit
                  }}
                  onShare={() => {
                    // TODO: Implement share
                  }}
                  onDelete={async () => {
                    await dbHelpers.deleteQuery(query.id);
                    loadRecentQueries();
                  }}
                  onClick={handleOpenLibrary}
                />
              ))}
            </div>
          </div>
        )}

        {recentQueries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-600 mb-4">
              <Library className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">No queries saved yet</p>
            </div>
            <Button variant="primary" onClick={() => setShowSaveModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Save Your First Query
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{queries.length} queries saved</span>
        <button className="hover:text-slate-700 dark:hover:text-slate-300">
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Save Query Modal */}
      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setPendingQuery(null);
          loadRecentQueries();
          loadAllQueries();
        }}
        initialQuery={pendingQuery?.query}
        initialSource={pendingQuery?.source}
      />
    </div>
  );
}
