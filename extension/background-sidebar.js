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




