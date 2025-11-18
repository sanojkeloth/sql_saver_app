import { Copy, Edit, Share2, Trash2, Clock, Tag } from 'lucide-react';
import { SQLQuery } from '../types';
import { formatDistance } from 'date-fns';

interface QueryCardProps {
  query: SQLQuery;
  onCopy: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function QueryCard({ query, onCopy, onEdit, onShare, onDelete, onClick }: QueryCardProps) {
  const previewLines = query.query.split('\n').slice(0, 3).join('\n');
  const hasMore = query.query.split('\n').length > 3;

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {query.title}
          </h3>
          {query.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {query.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            title="Copy query"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            title="Edit query"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            title="Share query"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title="Delete query"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Query Preview */}
      <pre className="sql-code text-xs mb-3 overflow-hidden">
        <code>{previewLines}</code>
        {hasMore && <span className="text-slate-400">...</span>}
      </pre>

      {/* Tags */}
      {query.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          <Tag className="w-3 h-3 text-slate-400" />
          {query.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            >
              {tag}
            </span>
          ))}
          {query.tags.length > 3 && (
            <span className="text-xs text-slate-500">+{query.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDistance(new Date(query.updatedAt), new Date(), { addSuffix: true })}</span>
        </div>
        {query.usageCount > 0 && (
          <span>Used {query.usageCount} times</span>
        )}
      </div>
    </div>
  );
}
