browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_BOOKMARKS') {
        browser.bookmarks.getTree().then(bookmarkTree => {
            sendResponse({bookmarks: bookmarkTree});
        });
        return true; // Для асинхронного ответа
    }
});


function searchBookmarksRecursively(query, nodes, results = { folders: [], bookmarks: [] }) {
    query = query.toLowerCase();

    nodes.forEach(node => {
        const matchesQuery = node.title?.toLowerCase().includes(query) ||
                          (node.url && node.url.toLowerCase().includes(query));

        // Проверяем есть ли совпадения в дочерних элементах
        let hasMatchingChildren = false;
        if (node.children) {
            hasMatchingChildren = node.children.some(child =>
                child.title?.toLowerCase().includes(query) ||
                (child.url && child.url.toLowerCase().includes(query))
            );
        }

        // Добавляем папку только если она сама совпадает с запросом
        if (!node.url && (matchesQuery || hasMatchingChildren)) {
            // Проверяем на дубликаты
            if (!results.folders.some(f => f.id === node.id)) {
                results.folders.push(node);
            }
        }

        // Добавляем закладку если она совпадает с запросом
        if (node.url && matchesQuery) {
            // Проверяем на дубликаты
            if (!results.bookmarks.some(b => b.id === node.id)) {
                results.bookmarks.push(node);
            }
        }

        // Рекурсивно ищем в дочерних элементах
        if (node.children) {
            searchBookmarksRecursively(query, node.children, results);
        }
    });

    return results;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_BOOKMARKS') {
        browser.bookmarks.getTree().then(bookmarkTree => {
            sendResponse({ bookmarks: bookmarkTree });
        });
        return true;
    }

    if (message.type === 'SEARCH_BOOKMARKS') {
        browser.bookmarks.search(message.query).then(searchResults => {
            // Группируем результаты
            const bookmarks = [];
            const folderIds = new Set();
            const folders = [];

            searchResults.forEach(result => {
                if (result.url) {
                    bookmarks.push(result);
                } else {
                    folderIds.add(result.id);
                    folders.push(result);
                }
            });

            // Добавляем родительские папки найденных закладок
            searchResults.forEach(async result => {
                if (result.parentId && !folderIds.has(result.parentId)) {
                    try {
                        const parent = await browser.bookmarks.get(result.parentId);
                        if (parent[0] && !parent[0].url) {
                            folderIds.add(parent[0].id);
                            folders.push(parent[0]);
                        }
                    } catch (error) {
                        console.error('Error fetching parent folder:', error);
                    }
                }
            });

            // Сортируем результаты
            sendResponse({
                results: {
                    folders: folders.sort((a, b) => a.title.localeCompare(b.title)),
                    bookmarks: bookmarks.sort((a, b) => b.dateAdded - a.dateAdded)
                }
            });
        });
        return true;
    }
});
