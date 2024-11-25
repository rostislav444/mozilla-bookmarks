// App.jsx
import React, {useRef, useState} from 'react';
import {BookmarkFolder} from "@components/BookmarksFolder.jsx";
import {QuickLinks, useFavorites} from "@components/QuickLinks.jsx";
import {ServicesMenu} from "@components/Services/index.jsx";
import {SearchBar} from "@components/SearchBar.jsx";
import {useAppMode, useBookmarksData} from "@/App/context/BookmarksContext";
import UserProfile from "@components/UserProfile.jsx";
import {useTheme} from "@/App/context/ThemeContext.jsx";
import WeatherClockWidget from "@components/WeatherClock.jsx";
import {Loader2} from "lucide-react";

function App() {
    const {colors, classes} = useTheme();
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
            <div className="flex items-center justify-center min-h-screen bg-color1">
                <Loader2 className="w-12 h-12 text-color2 animate-spin"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${classes.background}`}>
            <div className="text-xl text-red-500">Ошибка загрузки закладок</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${classes.background}`}>
            {/*<button*/}
            {/*    onClick={() => setSidebarVisible(prev => !prev)}*/}
            {/*    className={`fixed bottom-4 left-3 z-50 ${classes.surface} p-2 rounded-lg ${classes.surfaceHover} transition-colors`}*/}
            {/*>*/}
            {/*    {sidebarVisible ? (*/}
            {/*        <Settings className={`w-5 h-5 ${classes.textSecondary}`}/>*/}
            {/*    ) : (*/}
            {/*        <Settings className={`w-5 h-5 ${classes.textSecondary}`}/>*/}
            {/*    )}*/}
            {/*</button>*/}

            <div
                className={`fixed top-0 left-0 w-72 h-full ${classes.surface} ${classes.border} transition-transform duration-300 ${
                    sidebarVisible ? 'translate-x-0 overflow-y-auto' : '-translate-x-[calc(100%-2px)]'
                }`}
            >
                <div className="p-4 mt-4">
                    <div className={`text-lg font-semibold ${classes.text} mb-4`}>
                        Настройки
                    </div>
                    {/*{bookmarks[0]?.children?.map((rootFolder) => (*/}
                    {/*    <FolderTree*/}
                    {/*        key={rootFolder.id}*/}
                    {/*        node={rootFolder}*/}
                    {/*        onFolderClick={scrollToFolder}*/}
                    {/*    />*/}
                    {/*))}*/}
                </div>
            </div>

            <div className={`transition-all duration-300 ${sidebarVisible && 'pl-72'}`}>
                <div className="p-8">
                    <div className="max-w-full mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <WeatherClockWidget/>
                            {/*<div>*/}
                            {/*    <button*/}
                            {/*        onClick={() => setSidebarVisible(prev => !prev)}*/}
                            {/*        className={`*/}
                            {/*        z-50  p-2 rounded-lg  transition-colors*/}
                            {/*        bg-color1 hover:bg-color2*/}
                            {/*        `}*/}
                            {/*    >*/}
                            {/*        {sidebarVisible ? (*/}
                            {/*            <Settings className={`w-5 h-5 ${classes.textSecondary}`}/>*/}
                            {/*        ) : (*/}
                            {/*            <Settings className={`w-5 h-5 ${classes.textSecondary}`}/>*/}
                            {/*        )}*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                            <div className="flex items-center gap-4">
                                <ServicesMenu/>
                                <UserProfile/>
                            </div>
                        </div>

                        {isExtension && (
                            <div className='flex w-full justify-center align-middle'>
                                <SearchBar/>
                            </div>
                        )}

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