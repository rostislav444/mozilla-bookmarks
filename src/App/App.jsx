import React, {useEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {BookmarkFolder} from "@components/BookmarksFolder.jsx"
import {FolderTree} from "@components/FolderTree.jsx";
import {QuickLinks, useFavorites} from "@components/QuickLinks.jsx";
import {ServicesMenu} from "@components/Services/index.jsx";
import {SearchBar} from "@components/SearchBar.jsx";


function App() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const mainContentRef = useRef(null);
    const {favorites, addToFavorites, removeFromFavorites, isFavorite, updateFavorites} = useFavorites();

    const scrollToFolder = (folderId) => {
        const element = document.getElementById(`folder-${folderId}`);
        if (element) {
            element.scrollIntoView({block: 'start'});
        }
    };

    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const tree = await browser.bookmarks.getTree();
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
            } catch (error) {
                console.error('Error loading bookmarks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBookmarks();

        browser.bookmarks.onCreated.addListener(loadBookmarks);
        browser.bookmarks.onRemoved.addListener(loadBookmarks);
        browser.bookmarks.onChanged.addListener(loadBookmarks);
        browser.bookmarks.onMoved.addListener(loadBookmarks);

        return () => {
            browser.bookmarks.onCreated.removeListener(loadBookmarks);
            browser.bookmarks.onRemoved.removeListener(loadBookmarks);
            browser.bookmarks.onChanged.removeListener(loadBookmarks);
            browser.bookmarks.onMoved.removeListener(loadBookmarks);
        };
    }, []);

    if (loading) {
        return (<div className="flex items-center justify-center min-h-screen bg-[#1C1B22]">
            <div className="text-xl text-white">Загрузка закладок...</div>
        </div>);
    }

    const handleToggleFavorite = (bookmark) => {
        if (isFavorite(bookmark.id)) {
            removeFromFavorites(bookmark.id);
        } else {
            addToFavorites(bookmark);
        }
    };

    return (<div className="min-h-screen bg-[#1C1B22]"> {/* Изменен на более темный цвет как панель закладок */}
        <button
            onClick={() => setSidebarVisible(prev => !prev)}
            className="fixed top-4 left-3 z-50 bg-[#2B2A33] p-2 rounded-lg hover:bg-[#52525E] transition-colors"
        >
            {sidebarVisible ? <ChevronLeft className="w-5 h-5 text-gray-400"/> :
                <ChevronRight className="w-5 h-5 text-gray-400"/>}
        </button>

        <div
            className={`fixed  top-0 left-0 w-72 h-full bg-[#2B2A33] border-r border-gray-700/50 transition-transform duration-300 ${sidebarVisible ? 'translate-x-0 overflow-y-auto' : '-translate-x-[calc(100%-24px)]'}`}
        >
            <div className="p-4 mt-12 ">
                <div className="text-lg font-semibold text-white mb-4">Структура папок</div>
                {bookmarks[0]?.children?.map((rootFolder) => (<FolderTree
                    key={rootFolder.id}
                    node={rootFolder}
                    onFolderClick={scrollToFolder}
                />))}
            </div>
        </div>

        <div className={`transition-all duration-300 ${sidebarVisible ? 'pl-72' : 'pl-6'}`}>
            <div className="p-8">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <SearchBar/>
                        <div className="flex items-center gap-4">
                             <ServicesMenu />
                        </div>
                    </div>

                    <QuickLinks
                        favorites={favorites}
                        updateFavorites={updateFavorites}
                    />

                    <div className="space-y-6" ref={mainContentRef}>
                        {bookmarks[0]?.children?.map((rootFolder) => (<BookmarkFolder
                            key={rootFolder.id}
                            node={rootFolder}
                            isFavorite={isFavorite}
                            onToggleFavorite={handleToggleFavorite}
                        />))}
                    </div>
                </div>
            </div>
        </div>
    </div>);
}

export default App;