import { useEffect, useState } from 'react';
import { X, Copy, Edit2, Trash2, Clock, History, ExternalLink } from 'lucide-react';
import { SQLQuery, QueryVersion } from '../types';
import { dbHelpers } from '../db';
import { formatDistance } from 'date-fns';
import { Button } from './Button';

interface QueryDetailViewProps {
  queryId: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function QueryDetailView({ queryId, onClose, onEdit, onDelete }: QueryDetailViewProps) {
  const [query, setQuery] = useState<SQLQuery | null>(null);
  const [versions, setVersions] = useState<QueryVersion[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'versions'>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuery();
    loadVersions();
  }, [queryId]);

  const loadQuery = async () => {
    setLoading(true);
    const q = await dbHelpers.getQuery(queryId);
    setQuery(q || null);
    setLoading(false);
  };

  const loadVersions = async () => {
    const v = await dbHelpers.getVersionsByQuery(queryId);
    setVersions(v);
  };

  const handleCopy = async () => {
    if (query) {
      await navigator.clipboard.writeText(query.query);
      await dbHelpers.incrementUsageCount(query.id);
      // Show toast notification
      alert('Query copied to clipboard!');
    }
  };

  const handleCreateVersion = async () => {
    if (!query) return;

    const comment = prompt('Version comment (optional):');
    const nextVersion = versions.length + 1;

    await dbHelpers.createVersion({
      queryId: query.id,
      version: nextVersion,
      query: query.query,
      description: query.description,
      createdBy: 'current-user',
      comment: comment || undefined,
    });

    loadVersions();
    alert('Version created successfully!');
  };

  const handleRestoreVersion = async (version: QueryVersion) => {
    if (!query) return;

    if (confirm(`Restore to version ${version.version}? Current version will be saved.`)) {
      // Create version of current state first
      await handleCreateVersion();

      // Restore old version
      await dbHelpers.updateQuery(query.id, {
        query: version.query,
        description: version.description,
      });

      loadQuery();
      alert('Version restored!');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Query not found</p>
          <Button onClick={onClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {query.title}
            </h1>
            {query.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {query.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated {formatDistance(new Date(query.updatedAt), new Date(), { addSuffix: true })}</span>
          </div>
          {query.usageCount > 0 && (
            <span>Used {query.usageCount} times</span>
          )}
          {query.metadata.queryType && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              {query.metadata.queryType}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Query
          </Button>
          <Button variant="secondary" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="secondary" onClick={handleCreateVersion}>
            <History className="w-4 h-4 mr-2" />
            Create Version
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-4 px-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Current Version
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Version History ({versions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'current' && (
          <div>
            {/* Tags */}
            {query.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {query.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SQL Query */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  SQL Query
                </h3>
                <span className="text-xs text-slate-500">
                  {query.metadata.lineCount || 0} lines
                </span>
              </div>
              <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-slate-900 dark:text-slate-100">
                  {query.query}
                </code>
              </pre>
            </div>

            {/* Tables Referenced */}
            {query.metadata.tablesReferenced && query.metadata.tablesReferenced.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tables Referenced
                </h3>
                <div className="flex flex-wrap gap-2">
                  {query.metadata.tablesReferenced.map((table) => (
                    <span
                      key={table}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono"
                    >
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {query.source && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Source
                </h3>
                <a
                  href={query.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  {query.source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <div>
            {versions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No version history yet
                </p>
                <Button onClick={handleCreateVersion}>
                  Create First Version
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          Version {version.version}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistance(new Date(version.createdAt), new Date(), { addSuffix: true })}
                        </p>
                        {version.comment && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {version.comment}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreVersion(version)}
                      >
                        Restore
                      </Button>
                    </div>
                    <pre className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto mt-2">
                      <code className="font-mono text-slate-900 dark:text-slate-100">
                        {version.query}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
