// Background service worker for SQL Saver Chrome Extension

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item for saving selected text as SQL
  chrome.contextMenus.create({
    id: 'save-sql-query',
    title: 'Save SQL Query',
    contexts: ['selection'],
  });

  // Create context menu item to open side panel
  chrome.contextMenus.create({
    id: 'open-library',
    title: 'Open SQL Library',
    contexts: ['all'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-sql-query' && info.selectionText) {
    // Send message to popup/sidepanel to save query
    chrome.runtime.sendMessage({
      type: 'SAVE_QUERY',
      data: {
        query: info.selectionText,
        source: tab?.url,
      },
    });

    // Open side panel
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
  }

  if (info.menuItemId === 'open-library' && tab?.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }

  if (message.type === 'COPY_TO_CLIPBOARD') {
    // Copy text to clipboard
    copyToClipboard(message.data.text);
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Helper to copy text to clipboard
function copyToClipboard(text: string) {
  // Since we can't directly access clipboard in service worker,
  // we'll send message to content script or active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'COPY_TO_CLIPBOARD',
        data: { text },
      });
    }
  });
}

console.log('SQL Saver background service worker initialized');
