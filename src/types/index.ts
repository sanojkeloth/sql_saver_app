// Core data types for SQL Saver

export interface SQLQuery {
  id: string;
  title: string;
  query: string;
  description?: string;
  tags: string[];
  folderId?: string;
  visibility: 'private' | 'team' | 'shared';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  usageCount: number;
  lastUsedAt?: Date;
  source?: string; // URL where query was captured
  metadata: {
    queryType?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER';
    tablesReferenced?: string[];
    lineCount?: number;
  };
  sharedWith?: SharedPermission[];
  teamId?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  visibility: 'private' | 'team';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  teamId?: string;
  sharedWith?: SharedPermission[];
}

export interface SharedPermission {
  userId?: string;
  teamId?: string;
  role: 'viewer' | 'editor' | 'admin';
  sharedAt: Date;
  sharedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  preferences: UserPreferences;
  teams: string[]; // team IDs
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  members: TeamMember[];
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  invitedBy: string;
}

export interface TeamSettings {
  defaultVisibility: 'private' | 'team';
  requireApprovalForSharing: boolean;
  allowGuestAccess: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultFolder?: string;
  autoSave: boolean;
  enableClipboardMonitoring: boolean;
  sqlFormatter: {
    indent: number;
    uppercase: boolean;
    linesBetweenQueries: number;
  };
}

export interface QueryVersion {
  id: string;
  queryId: string;
  version: number;
  query: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  comment?: string;
  tag?: string; // e.g., 'production', 'tested', 'draft'
}

export interface SearchFilter {
  query?: string;
  tags?: string[];
  folderId?: string;
  visibility?: 'private' | 'team' | 'shared';
  dateRange?: {
    from: Date;
    to: Date;
  };
  createdBy?: string;
  queryType?: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'shared' | 'version_created';
  entityType: 'query' | 'folder' | 'team';
  entityId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, unknown>;
}
