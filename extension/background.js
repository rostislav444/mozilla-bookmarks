browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SEARCH_SUGGESTIONS') {
        fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(message.query)}`)
            .then(response => response.json())
            .then(data => {
                // DuckDuckGo возвращает массив объектов с полем "phrase"
                const suggestions = data.map(item => item.phrase);
                sendResponse(suggestions);
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                sendResponse([]);
            });
        return true; // Важно для асинхронного ответа
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_BOOKMARKS') {
        browser.bookmarks.getTree().then(bookmarkTree => {
            sendResponse({ bookmarks: bookmarkTree });
        });
        return true; // Для асинхронного ответа
    }
});

// Создаем кнопку для сайдбара
browser.menus.create({
  id: 'toggle-sidebar',
  title: 'Показать боковую панель',
  contexts: ['browser_action'],
  icons: {
    "48": "icons/sidebar.svg"
  }
});

// Обработчик клика по кнопке меню
browser.menus.onClicked.addListener((info) => {
  if (info.menuItemId === 'toggle-sidebar') {
    // Ваш код для переключения сайдбара
  }
});

// Остальной код background.js остается без изменений
let sidebarVisible = false;

async function checkBookmarkStatus(url) {
  if (!url) return false;
  const bookmarks = await browser.bookmarks.search({ url });
  return bookmarks.length > 0;
}

async function updateBookmarkIcon(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    const isBookmarked = await checkBookmarkStatus(tab.url);

    await browser.browserAction.setIcon({
      path: isBookmarked ? "icons/bookmark-filled.svg" : "icons/bookmark.svg",
      tabId
    });
  } catch (error) {
    console.error('Error updating bookmark icon:', error);
  }
}

// Слушатели событий
browser.tabs.onActivated.addListener(async (activeInfo) => {
  await updateBookmarkIcon(activeInfo.tabId);
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    await updateBookmarkIcon(tabId);
  }
});

browser.bookmarks.onCreated.addListener(async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    await updateBookmarkIcon(tabs[0].id);
  }
});

browser.bookmarks.onRemoved.addListener(async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    await updateBookmarkIcon(tabs[0].id);
  }
});