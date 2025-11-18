# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Chrome browser
- Git

### First Time Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sql_saver_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Toggle "Developer mode" on (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Development Workflow

#### Hot Reload Development

For the best development experience:

```bash
npm run watch
```

This command will:
- Watch for file changes
- Rebuild automatically
- However, you still need to manually reload the extension in Chrome

**To reload the extension:**
- Go to `chrome://extensions/`
- Click the reload icon on the SQL Saver card
- Or use the keyboard shortcut: `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)

#### Testing Changes

1. **Popup UI**: Click the extension icon in the toolbar
2. **Side Panel**: Right-click the extension icon → "Open Side Panel"
3. **Content Script**: Navigate to BigQuery, Snowflake, or other SQL editor
4. **Background Script**: Check `chrome://extensions/` → SQL Saver → "Inspect views: service worker"

## Architecture

### Extension Components

**Background Service Worker** (`src/background/index.ts`)
- Handles context menus
- Manages keyboard shortcuts
- Routes messages between components
- Persistent storage operations

**Content Script** (`src/content/index.ts`)
- Injected into SQL editor pages
- Detects SQL queries on the page
- Captures selected text
- Shows notifications

**Popup** (`src/popup/`)
- Quick access interface (400x600px)
- Recent queries
- Quick save functionality
- Search entry point

**Side Panel** (`src/sidepanel/`)
- Full library interface
- Grid/list views
- Folder management
- Advanced search and filtering

### Data Flow

```
User Action → Content Script → Background Script → IndexedDB
                                                ↓
                                          Popup/SidePanel
                                                ↓
                                            UI Update
```

### State Management

We use Zustand for global state:
- Lightweight and performant
- No boilerplate
- DevTools support
- TypeScript-first

**Store Location**: `src/store/index.ts`

**Key State**:
- `queries`: All SQL queries
- `folders`: Folder structure
- `user`: Current user (for future auth)
- `currentView`: Active view in library
- UI state (modals, selections, etc.)

### Database Layer

**Technology**: Dexie.js (IndexedDB wrapper)

**Schema** (`src/db/index.ts`):
- `queries`: SQL queries with metadata
- `folders`: Folder organization
- `users`: User profiles
- `teams`: Team information
- `versions`: Query version history
- `activities`: Activity log

**Helper Functions** (`src/db/index.ts`):
- `createQuery()`, `updateQuery()`, `deleteQuery()`
- `searchQueries()`, `getRecentQueries()`
- `createFolder()`, `getFoldersByParent()`
- All CRUD operations for entities

## Adding Features

### Adding a New Component

1. Create component file in `src/components/`:
   ```tsx
   // src/components/MyComponent.tsx
   import React from 'react';

   export function MyComponent() {
     return <div>My Component</div>;
   }
   ```

2. Use TypeScript for props:
   ```tsx
   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     // ...
   }
   ```

3. Use Tailwind for styling (see Design System below)

### Adding a New Database Entity

1. Define type in `src/types/index.ts`:
   ```typescript
   export interface MyEntity {
     id: string;
     name: string;
     createdAt: Date;
   }
   ```

2. Add table to database in `src/db/index.ts`:
   ```typescript
   myEntities!: Table<MyEntity, string>;

   // In constructor:
   this.version(2).stores({
     // ... existing tables
     myEntities: 'id, name, createdAt'
   });
   ```

3. Add helper functions:
   ```typescript
   async createMyEntity(entity: Omit<MyEntity, 'id' | 'createdAt'>): Promise<string> {
     const id = crypto.randomUUID();
     const now = new Date();
     const newEntity: MyEntity = { ...entity, id, createdAt: now };
     await db.myEntities.add(newEntity);
     return id;
   }
   ```

### Adding a New View/Page

1. Create the component
2. Add route in state (if needed)
3. Update navigation in sidebar
4. Add to `currentView` type in store

## Design System

### Colors

**Primary** (Purple/Blue):
- 500: `#5b5fff` (main brand color)
- Used for: buttons, links, selected states

**Neutrals** (Slate):
- 100-900: Various gray shades
- Used for: text, borders, backgrounds

### Typography

**Font Families**:
- Sans: `Inter` (UI text)
- Mono: `JetBrains Mono` (code)

**Sizes**:
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px

### Components

**Button** (`Button.tsx`):
```tsx
<Button variant="primary" size="md">Click Me</Button>
// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
```

**Input** (`Input.tsx`):
```tsx
<Input
  label="Name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
/>
```

**Modal** (`Modal.tsx`):
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  size="md"
>
  Content here
</Modal>
```

### Spacing

Use Tailwind's spacing scale (4px base unit):
- `p-2` = 8px
- `p-4` = 16px
- `gap-3` = 12px
- `mb-6` = 24px

### Dark Mode

All components support dark mode via Tailwind's `dark:` prefix:
```tsx
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-slate-100">Text</p>
</div>
```

## Debugging

### Chrome DevTools

**Background Service Worker**:
1. Go to `chrome://extensions/`
2. Find SQL Saver
3. Click "Inspect views: service worker"

**Popup**:
1. Right-click extension icon
2. Select "Inspect"

**Side Panel**:
1. Open side panel
2. Right-click anywhere
3. Select "Inspect"

**Content Script**:
1. Open any page where content script runs
2. Open DevTools (F12)
3. Check Console for logs

### Common Issues

**Extension not loading:**
- Check for errors in `chrome://extensions/`
- Verify manifest.json is valid
- Rebuild with `npm run build`

**Changes not appearing:**
- Reload extension in `chrome://extensions/`
- Hard refresh the page (Cmd+Shift+R)
- Clear cache and rebuild

**Database errors:**
- Check IndexedDB in DevTools (Application → IndexedDB)
- Clear database: `await db.delete()`
- Reinitialize with new data

## Testing

### Manual Testing Checklist

**Query Capture**:
- [ ] Right-click context menu works
- [ ] Keyboard shortcut (Cmd+Shift+S) works
- [ ] Manual entry in popup works

**Query Management**:
- [ ] Save query with all metadata
- [ ] Edit existing query
- [ ] Delete query (with confirmation)
- [ ] Copy query to clipboard

**Organization**:
- [ ] Create folders
- [ ] Move queries between folders
- [ ] Add/remove tags
- [ ] Change visibility

**Search**:
- [ ] Full-text search works
- [ ] Search in titles
- [ ] Search in descriptions
- [ ] Search in tags

**UI**:
- [ ] Dark mode works
- [ ] Grid/list view toggle
- [ ] Responsive layout
- [ ] All buttons functional

## Performance

### Bundle Size

Current target: < 2MB for dist folder

Check bundle size:
```bash
npm run build
du -sh dist/
```

### Optimization Tips

1. **Code splitting**: Vite does this automatically
2. **Lazy loading**: Use `React.lazy()` for large components
3. **Debouncing**: Use for search inputs (already implemented)
4. **Virtual scrolling**: For large query lists (future)

## Next Steps

### Immediate Priorities

1. **Add placeholder icons** (16x16, 32x32, 48x48, 128x128)
2. **Implement sharing UI** (modal + backend integration)
3. **Add user authentication** (OAuth with Google/Microsoft)
4. **Build backend API** (Node.js + PostgreSQL)

### Future Enhancements

- Export/import queries
- Query templates
- Syntax validation
- Schema integration
- Collaborative editing
- Mobile app

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Dexie.js Docs](https://dexie.org/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
