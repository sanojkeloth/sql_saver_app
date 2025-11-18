// SQL parsing and formatting utilities
import { format } from 'sql-formatter';

export function formatSQL(sql: string, options?: { uppercase?: boolean; indent?: number }): string {
  try {
    return format(sql, {
      language: 'sql',
      keywordCase: options?.uppercase ? 'upper' : 'preserve',
      tabWidth: options?.indent ?? 2,
    });
  } catch (error) {
    console.error('Error formatting SQL:', error);
    return sql;
  }
}

export function detectQueryType(sql: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER' {
  const trimmed = sql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
    return 'SELECT';
  }
  if (trimmed.startsWith('INSERT')) {
    return 'INSERT';
  }
  if (trimmed.startsWith('UPDATE')) {
    return 'UPDATE';
  }
  if (trimmed.startsWith('DELETE')) {
    return 'DELETE';
  }
  if (
    trimmed.startsWith('CREATE') ||
    trimmed.startsWith('ALTER') ||
    trimmed.startsWith('DROP') ||
    trimmed.startsWith('TRUNCATE')
  ) {
    return 'DDL';
  }

  return 'OTHER';
}

export function extractTablesFromSQL(sql: string): string[] {
  const tables = new Set<string>();

  // Simple regex-based extraction (not perfect but works for most cases)
  const fromPattern = /from\s+([a-z0-9_]+(?:\.[a-z0-9_]+)*)/gi;
  const joinPattern = /join\s+([a-z0-9_]+(?:\.[a-z0-9_]+)*)/gi;

  let match;
  while ((match = fromPattern.exec(sql)) !== null) {
    tables.add(match[1]);
  }
  while ((match = joinPattern.exec(sql)) !== null) {
    tables.add(match[1]);
  }

  return Array.from(tables);
}

export function generateQueryTitle(sql: string): string {
  const type = detectQueryType(sql);
  const tables = extractTablesFromSQL(sql);

  if (tables.length > 0) {
    return `${type} from ${tables.slice(0, 2).join(', ')}${tables.length > 2 ? '...' : ''}`;
  }

  return `${type} Query`;
}

export function isValidSQL(sql: string): boolean {
  // Basic validation - check if it looks like SQL
  const trimmed = sql.trim().toUpperCase();
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
    'WITH', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'HAVING'
  ];

  return sqlKeywords.some(keyword => trimmed.includes(keyword));
}

export function getLineCount(sql: string): number {
  return sql.split('\n').length;
}
