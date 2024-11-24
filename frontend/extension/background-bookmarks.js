async function checkBookmarkStatus(url) {
    if (!url) return false;
    const bookmarks = await browser.bookmarks.search({url});
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
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
        await updateBookmarkIcon(tabs[0].id);
    }
});

browser.bookmarks.onRemoved.addListener(async () => {
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
        await updateBookmarkIcon(tabs[0].id);
    }
});