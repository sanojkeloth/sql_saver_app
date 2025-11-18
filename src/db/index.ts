// IndexedDB database using Dexie
import Dexie, { Table } from 'dexie';
import { SQLQuery, Folder, User, Team, QueryVersion, Activity } from '../types';

export class SQLSaverDB extends Dexie {
  queries!: Table<SQLQuery, string>;
  folders!: Table<Folder, string>;
  users!: Table<User, string>;
  teams!: Table<Team, string>;
  versions!: Table<QueryVersion, string>;
  activities!: Table<Activity, string>;

  constructor() {
    super('SQLSaverDB');

    this.version(1).stores({
      queries: 'id, title, folderId, visibility, createdBy, createdAt, updatedAt, lastUsedAt, teamId, *tags',
      folders: 'id, name, parentId, visibility, createdBy, teamId',
      users: 'id, email',
      teams: 'id, name, createdBy',
      versions: 'id, queryId, version, createdAt, createdBy',
      activities: 'id, entityType, entityId, userId, timestamp'
    });
  }
}

export const db = new SQLSaverDB();

// Helper functions for common operations
export const dbHelpers = {
  // Queries
  async createQuery(query: Omit<SQLQuery, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newQuery: SQLQuery = {
      ...query,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.queries.add(newQuery);
    return id;
  },

  async updateQuery(id: string, updates: Partial<SQLQuery>): Promise<void> {
    await db.queries.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async getQuery(id: string): Promise<SQLQuery | undefined> {
    return db.queries.get(id);
  },

  async deleteQuery(id: string): Promise<void> {
    await db.queries.delete(id);
    // Also delete associated versions
    await db.versions.where('queryId').equals(id).delete();
  },

  async searchQueries(searchText: string): Promise<SQLQuery[]> {
    const lowerSearch = searchText.toLowerCase();
    return db.queries
      .filter(q =>
        q.title.toLowerCase().includes(lowerSearch) ||
        q.query.toLowerCase().includes(lowerSearch) ||
        q.description?.toLowerCase().includes(lowerSearch) ||
        q.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      )
      .toArray();
  },

  async getQueriesByFolder(folderId?: string): Promise<SQLQuery[]> {
    if (folderId === undefined) {
      // Root level (no folder)
      return db.queries.filter(q => !q.folderId || q.folderId === '').toArray();
    }
    return db.queries.where('folderId').equals(folderId).toArray();
  },

  async getRecentQueries(limit: number = 10): Promise<SQLQuery[]> {
    return db.queries
      .orderBy('lastUsedAt')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async incrementUsageCount(id: string): Promise<void> {
    const query = await db.queries.get(id);
    if (query) {
      await db.queries.update(id, {
        usageCount: (query.usageCount || 0) + 1,
        lastUsedAt: new Date(),
      });
    }
  },

  // Folders
  async createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newFolder: Folder = {
      ...folder,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.folders.add(newFolder);
    return id;
  },

  async getFolder(id: string): Promise<Folder | undefined> {
    return db.folders.get(id);
  },

  async getFoldersByParent(parentId?: string): Promise<Folder[]> {
    if (parentId === undefined) {
      return db.folders.filter(f => !f.parentId || f.parentId === '').toArray();
    }
    return db.folders.where('parentId').equals(parentId).toArray();
  },

  async getAllFolders(): Promise<Folder[]> {
    return db.folders.toArray();
  },

  async deleteFolder(id: string): Promise<void> {
    await db.folders.delete(id);
    // Also delete queries in this folder
    await db.queries.where('folderId').equals(id).delete();
  },

  // Versions
  async createVersion(version: Omit<QueryVersion, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newVersion: QueryVersion = {
      ...version,
      id,
      createdAt: new Date(),
    };
    await db.versions.add(newVersion);
    return id;
  },

  async getVersionsByQuery(queryId: string): Promise<QueryVersion[]> {
    return db.versions
      .where('queryId')
      .equals(queryId)
      .reverse()
      .sortBy('version');
  },

  // Activities
  async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    const id = crypto.randomUUID();
    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: new Date(),
    };
    await db.activities.add(newActivity);
  },

  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    return db.activities
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  },
};
