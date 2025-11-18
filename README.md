# SQL Saver - Chrome Extension

Save, organize, and share SQL queries with your team. A browser-native tool for SQL developers and data analysts.

## Features

### ✅ Implemented (v0.1)
- **Query Capture**: Right-click context menu to save SQL queries from any webpage
- **Local Storage**: IndexedDB for offline-first functionality
- **Organization**: Folders and tags for organizing queries
- **Search**: Full-text search across queries, titles, descriptions, and tags
- **Query Library**: Beautiful grid/list view with syntax highlighting
- **Query Editor**: Format SQL, add metadata, and version control
- **Quick Actions**: Popup for fast access to recent queries
- **Side Panel**: Full-featured library interface

### 🚧 Coming Soon
- **Cloud Sync**: Sync queries across devices
- **Team Collaboration**: Share queries with team members
- **Permissions**: Fine-grained access control
- **Version Control**: Track changes to queries
- **Authentication**: User accounts with OAuth
- **Query History**: Track usage and modifications
- **Export/Import**: Backup and restore queries

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Dexie (IndexedDB wrapper)
- **Build Tool**: Vite
- **Chrome APIs**: Manifest V3

## Installation

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode (with hot reload)

```bash
npm run watch
```

This will watch for changes and rebuild automatically. You'll need to reload the extension in Chrome after changes.

## Usage

### Saving Queries

**Method 1: Context Menu**
1. Select SQL text on any webpage
2. Right-click and select "Save SQL Query"
3. Fill in the details and save

**Method 2: Manual Entry**
1. Click the extension icon
2. Click "Save New Query"
3. Paste your SQL and add metadata

**Method 3: Keyboard Shortcut**
1. Select SQL text
2. Press `Cmd/Ctrl + Shift + S`
3. Extension opens with save dialog

### Organizing Queries

- **Folders**: Create nested folders to organize queries by project, team, or topic
- **Tags**: Add multiple tags to each query for cross-categorization
- **Visibility**: Set queries as Private, Team, or Shared

### Searching Queries

- Full-text search in query content, titles, and descriptions
- Filter by tags, folders, and date ranges
- View recent queries for quick access

## Project Structure

```
sql_saver_app/
├── public/
│   └── manifest.json          # Chrome extension manifest
├── src/
│   ├── background/
│   │   └── index.ts           # Background service worker
│   ├── content/
│   │   └── index.ts           # Content script for page integration
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── QueryCard.tsx
│   │   └── SaveQueryModal.tsx
│   ├── popup/
│   │   ├── Popup.tsx          # Extension popup UI
│   │   └── main.tsx
│   ├── sidepanel/
│   │   ├── SidePanel.tsx      # Full library interface
│   │   └── main.tsx
│   ├── db/
│   │   └── index.ts           # IndexedDB database layer
│   ├── store/
│   │   └── index.ts           # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── utils/
│   │   └── sqlParser.ts       # SQL parsing utilities
│   └── styles/
│       └── global.css         # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Development

### Available Scripts

- `npm run dev` - Start Vite dev server (for development UI testing)
- `npm run build` - Build production extension
- `npm run watch` - Build and watch for changes
- `npm run lint` - Lint code with ESLint
- `npm run type-check` - Check TypeScript types

### Adding New Features

1. **Data Models**: Update types in `src/types/index.ts`
2. **Database**: Add helpers in `src/db/index.ts`
3. **UI Components**: Create in `src/components/`
4. **State**: Update store in `src/store/index.ts`

## Roadmap

### Phase 1: Core Functionality ✅
- [x] Chrome extension setup
- [x] Query capture and storage
- [x] Local database with IndexedDB
- [x] Basic UI (popup + sidepanel)
- [x] Search and organization
- [x] Folders and tags

### Phase 2: Collaboration (Next)
- [ ] Backend API setup
- [ ] User authentication
- [ ] Cloud sync
- [ ] Team management
- [ ] Sharing and permissions

### Phase 3: Advanced Features
- [ ] Version control for queries
- [ ] Query history and activity log
- [ ] Advanced search (semantic search)
- [ ] Export/import functionality
- [ ] Browser extension for Edge/Firefox

### Phase 4: Enterprise
- [ ] SSO integration
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] On-premise deployment option

## Contributing

This is currently a private project. Contributions will be welcomed once we open-source.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
