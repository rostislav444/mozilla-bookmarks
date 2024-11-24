// context/BookmarksContext.jsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import {BookmarksAdapterFactory} from '@/App/utils/dataAdapter';

// Определяем режим работы приложения
const isExtension = typeof browser !== 'undefined' && browser.bookmarks;
const mode = isExtension ? 'extension' : 'web';

// Создаем конфиг для веб-режима
const config = {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
};

const BookmarksContext = createContext(null);
const AppModeContext = createContext(null);

export function BookmarksProvider({children}) {
    const [adapter, setAdapter] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const [appMode] = useState({
        isExtension,
        isWeb: !isExtension,
        mode
    });

    useEffect(() => {
        const bookmarksAdapter = BookmarksAdapterFactory.create(mode, config);
        setAdapter(bookmarksAdapter);
        setIsInitialized(true);
    }, []);

    if (!isInitialized) {
        return null;
    }

    return (
        <AppModeContext.Provider value={appMode}>
            <BookmarksContext.Provider value={adapter}>
                {children}
            </BookmarksContext.Provider>
        </AppModeContext.Provider>
    );
}

// Хук для использования адаптера закладок
export function useBookmarks() {
    const context = useContext(BookmarksContext);
    if (context === null) {
        throw new Error('useBookmarks must be used within a BookmarksProvider');
    }
    return context;
}

// Новый хук для получения информации о режиме работы приложения
export function useAppMode() {
    const context = useContext(AppModeContext);
    if (context === null) {
        throw new Error('useAppMode must be used within a BookmarksProvider');
    }
    return context;
}

// Хук для загрузки данных закладок
export function useBookmarksData() {
    const bookmarksAdapter = useBookmarks();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                setLoading(true);
                const tree = await bookmarksAdapter.getTree();
                const toolbar = tree[0]?.children?.find(child => child.id === "toolbar_____");

                if (toolbar?.children) {
                    toolbar.children = [...toolbar.children].sort((a, b) => {
                        if ((!a.url && b.url) || (a.url && !b.url)) {
                            return a.url ? 1 : -1;
                        }
                        return a.title.localeCompare(b.title);
                    });
                    setBookmarks([{...tree[0], children: [toolbar]}]);
                }
            } catch (err) {
                console.error('Error loading bookmarks:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const handleBookmarkChanges = () => {
            loadBookmarks();
        };

        loadBookmarks();
        bookmarksAdapter.subscribeToChanges(handleBookmarkChanges);

        return () => {
            bookmarksAdapter.unsubscribeFromChanges(handleBookmarkChanges);
        };
    }, [bookmarksAdapter]);

    const refreshBookmarks = async () => {
        setLoading(true);
        try {
            const tree = await bookmarksAdapter.getTree();
            const toolbar = tree[0]?.children?.find(child => child.id === "toolbar_____");
            if (toolbar?.children) {
                toolbar.children = [...toolbar.children].sort((a, b) => {
                    if ((!a.url && b.url) || (a.url && !b.url)) {
                        return a.url ? 1 : -1;
                    }
                    return a.title.localeCompare(b.title);
                });
                setBookmarks([{...tree[0], children: [toolbar]}]);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        bookmarks,
        loading,
        error,
        refreshBookmarks
    };
}