// Content script for detecting and capturing SQL queries from web pages

console.log('SQL Saver content script loaded');

// Detect SQL editors on the page
const SQL_EDITOR_SELECTORS = [
  // BigQuery
  '.CodeMirror',
  '.monaco-editor',
  // Snowflake
  '[data-testid="sql-editor"]',
  // Generic SQL editors
  'textarea[class*="sql"]',
  'textarea[class*="query"]',
  'div[class*="sql-editor"]',
  'div[class*="query-editor"]',
];

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTED_TEXT') {
    const selectedText = window.getSelection()?.toString();
    if (selectedText && selectedText.trim()) {
      chrome.runtime.sendMessage({
        type: 'SAVE_QUERY',
        data: {
          query: selectedText,
          source: window.location.href,
        },
      });
    }
    sendResponse({ success: true });
  }

  if (message.type === 'COPY_TO_CLIPBOARD') {
    navigator.clipboard.writeText(message.data.text).then(() => {
      console.log('Text copied to clipboard');
      showNotification('Copied to clipboard!');
    });
    sendResponse({ success: true });
  }

  return true;
});

// Detect SQL queries in the page
function detectSQLEditor(): HTMLElement | null {
  for (const selector of SQL_EDITOR_SELECTORS) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
  }
  return null;
}

// Show notification overlay
function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #5b5fff;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add keyboard shortcut listener
document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl + Shift + S to quick save
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    const selectedText = window.getSelection()?.toString();
    if (selectedText && selectedText.trim()) {
      chrome.runtime.sendMessage({
        type: 'SAVE_QUERY',
        data: {
          query: selectedText,
          source: window.location.href,
        },
      });
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    }
  }
});

// Initialize
const editor = detectSQLEditor();
if (editor) {
  console.log('SQL editor detected:', editor);
}
