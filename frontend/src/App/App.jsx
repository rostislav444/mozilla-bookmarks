// App.jsx
import React, {useRef, useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {BookmarkFolder} from "@components/BookmarksFolder.jsx";
import {FolderTree} from "@components/FolderTree.jsx";
import {QuickLinks, useFavorites} from "@components/QuickLinks.jsx";
import {ServicesMenu} from "@components/Services/index.jsx";
import {SearchBar} from "@components/SearchBar.jsx";
import {useAppMode, useBookmarksData} from "@/App/context/BookmarksContext";
import UserProfile from "@components/UserProfile.jsx";

function App() {
    const {isExtension, isWeb, mode} = useAppMode();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const mainContentRef = useRef(null);
    const {favorites, addToFavorites, removeFromFavorites, isFavorite, updateFavorites} = useFavorites();
    const {bookmarks, loading, error, refreshBookmarks} = useBookmarksData();

    const scrollToFolder = (folderId) => {
        const element = document.getElementById(`folder-${folderId}`);
        if (element) {
            element.scrollIntoView({block: 'start'});
        }
    };

    const handleToggleFavorite = (bookmark) => {
        if (isFavorite(bookmark.id)) {
            removeFromFavorites(bookmark.id);
        } else {
            addToFavorites(bookmark);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1C1B22]">
                <div className="text-xl text-white">Загрузка закладок...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1C1B22]">
                <div className="text-xl text-red-500">Ошибка загрузки закладок</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1C1B22]">
            <button
                onClick={() => setSidebarVisible(prev => !prev)}
                className="fixed top-4 left-3 z-50 bg-[#2B2A33] p-2 rounded-lg hover:bg-[#52525E] transition-colors"
            >
                {sidebarVisible ?
                    <ChevronLeft className="w-5 h-5 text-gray-400"/> :
                    <ChevronRight className="w-5 h-5 text-gray-400"/>}
            </button>

            <div
                className={`fixed top-0 left-0 w-72 h-full bg-[#2B2A33] border-r border-gray-700/50 transition-transform duration-300 ${
                    sidebarVisible ? 'translate-x-0 overflow-y-auto' : '-translate-x-[calc(100%-24px)]'
                }`}
            >
                <div className="p-4 mt-12">
                    <div className="text-lg font-semibold text-white mb-4">Структура папок</div>
                    {/*{bookmarks[0]?.children?.map((rootFolder) => (*/}
                    {/*    <FolderTree*/}
                    {/*        key={rootFolder.id}*/}
                    {/*        node={rootFolder}*/}
                    {/*        onFolderClick={scrollToFolder}*/}
                    {/*    />*/}
                    {/*))}*/}
                </div>
            </div>

            <div className={`transition-all duration-300 ${sidebarVisible ? 'pl-72' : 'pl-6'}`}>
                <div className="p-8">
                    <div className="max-w-full mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            {isExtension && (<SearchBar/>)}
                            <div className="flex items-center gap-4">
                                <ServicesMenu/>
                                <UserProfile/>
                            </div>
                        </div>

                        <QuickLinks
                            favorites={favorites}
                            updateFavorites={updateFavorites}
                        />

                        <div className="space-y-6" ref={mainContentRef}>
                            {bookmarks[0]?.children?.map((rootFolder) => (
                                <BookmarkFolder
                                    key={rootFolder.id}
                                    node={rootFolder}
                                    isFavorite={isFavorite}
                                    onToggleFavorite={handleToggleFavorite}
                                    bookmarks={bookmarks[0]}
                                    onUpdate={refreshBookmarks}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;