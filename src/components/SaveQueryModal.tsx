import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Folder, Tag, Lock, Users, Globe } from 'lucide-react';
import { dbHelpers } from '../db';
import { useStore } from '../store';
import {
  detectQueryType,
  extractTablesFromSQL,
  formatSQL,
  getLineCount,
} from '../utils/sqlParser';

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialSource?: string;
  queryId?: string; // If editing existing query
}

export function SaveQueryModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialSource,
  queryId,
}: SaveQueryModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [visibility, setVisibility] = useState<'private' | 'team' | 'shared'>('private');
  const [saving, setSaving] = useState(false);

  const folders = useStore((state) => state.folders);
  const setFolders = useStore((state) => state.setFolders);
  const addQuery = useStore((state) => state.addQuery);
  const updateQuery = useStore((state) => state.updateQuery);

  useEffect(() => {
    if (isOpen) {
      // Reload folders when modal opens to get latest
      dbHelpers.getAllFolders().then(setFolders);

      if (queryId) {
        // Load existing query
        dbHelpers.getQuery(queryId).then((q) => {
          if (q) {
            setQuery(q.query);
            setTitle(q.title);
            setDescription(q.description || '');
            setTags(q.tags);
            setFolderId(q.folderId || '');
            setVisibility(q.visibility);
          }
        });
      } else {
        // For new queries, leave title blank
        setQuery(initialQuery);
        setTitle('');
        setDescription('');
        setTags([]);
        setFolderId('');
        setVisibility('private');
      }
    }
  }, [isOpen, queryId, initialQuery]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!query.trim() || !title.trim()) {
      return;
    }

    setSaving(true);

    try {
      const queryType = detectQueryType(query);
      const tables = extractTablesFromSQL(query);
      const lineCount = getLineCount(query);

      if (queryId) {
        // Update existing query
        await dbHelpers.updateQuery(queryId, {
          query,
          title,
          description,
          tags,
          folderId: folderId || undefined,
          visibility,
          metadata: {
            queryType,
            tablesReferenced: tables,
            lineCount,
          },
        });

        updateQuery(queryId, {
          query,
          title,
          description,
          tags,
          folderId: folderId || undefined,
          visibility,
          updatedAt: new Date(),
        });
      } else {
        // Create new query
        const id = await dbHelpers.createQuery({
          title,
          query,
          description,
          tags,
          folderId: folderId || undefined,
          visibility,
          createdBy: 'current-user', // TODO: Get from auth
          lastModifiedBy: 'current-user',
          usageCount: 0,
          source: initialSource,
          metadata: {
            queryType,
            tablesReferenced: tables,
            lineCount,
          },
        });

        const newQuery = await dbHelpers.getQuery(id);
        if (newQuery) {
          addQuery(newQuery);
        }
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving query:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setQuery('');
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setFolderId('');
    setVisibility('private');
  };

  const handleFormat = () => {
    setQuery(formatSQL(query));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={queryId ? 'Edit Query' : 'Save SQL Query'} size="xl">
      <div className="space-y-4">
        {/* Query Input */}
        <Textarea
          label="SQL Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={10}
          placeholder="SELECT * FROM users WHERE..."
          required
        />
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleFormat}>
            Format SQL
          </Button>
        </div>

        {/* Title */}
        <Input
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Active Users Report, Monthly Revenue..."
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="Add a description..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-primary-400 hover:text-primary-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Folder */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            <Folder className="inline w-4 h-4 mr-1" />
            Folder
          </label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Visibility
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                visibility === 'private'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Private</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('team')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                visibility === 'team'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Team</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('shared')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                visibility === 'shared'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Shared</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!query.trim() || !title.trim() || saving}>
            {saving ? 'Saving...' : queryId ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
