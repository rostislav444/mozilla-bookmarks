import {BookmarkItem} from "@components/BookmarkItem.jsx";
import {useState, useMemo, useEffect, useRef} from "react";
import {ChevronRight, Folder, ChevronLeft, Search} from 'lucide-react';
import {useBookmarks} from '@/App/context/BookmarksContext';

const ROWS_TO_SHOW = 3;
const FOLDER_WIDTH = 110;
const FOLDER_GAP = 8;

// Функция сортировки остается без изменений
const sortBookmarks = (items) => {
    return [...items].sort((a, b) => {
        const timeThreshold = 3600000;
        const timeDiff = Math.abs(b.dateAdded - a.dateAdded);

        if (timeDiff > timeThreshold) {
            return b.dateAdded - a.dateAdded;
        }

        if ((!a.url && b.url) || (a.url && !b.url)) {
            return a.url ? 1 : -1;
        }

        return a.title.localeCompare(b.title);
    });
};

export const BookmarkFolder = ({
                                   node,
                                   depth = 0,
                                   isFavorite,
                                   onToggleFavorite,
                                   bookmarks,
                                   onUpdate
                               }) => {
    const bookmarksAdapter = useBookmarks();
    const [currentPath, setCurrentPath] = useState([node]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [foldersPerPage, setFoldersPerPage] = useState(24);
    const [currentFolder, setCurrentFolder] = useState(node);
    const containerRef = useRef(null);

    if (!node) return null;

    // Обновляем функцию refreshCurrentFolder для работы с адаптером
    const refreshCurrentFolder = async () => {
        try {
            const updatedFolder = await bookmarksAdapter.getSubTree(currentFolder.id);
            if (updatedFolder && updatedFolder[0]) {
                const sortedFolder = {
                    ...updatedFolder[0],
                    children: sortBookmarks(updatedFolder[0].children || [])
                };
                setCurrentFolder(sortedFolder);

                const updatedPath = await Promise.all(
                    currentPath.map(async (folder) => {
                        const updated = await bookmarksAdapter.getSubTree(folder.id);
                        return {
                            ...updated[0],
                            children: sortBookmarks(updated[0].children || [])
                        };
                    })
                );
                setCurrentPath(updatedPath);
            }
        } catch (error) {
            console.error('Error refreshing folder:', error);
        }
    };

    useEffect(() => {
        const handleBookmarkChanges = () => {
            refreshCurrentFolder();
        };

        // Используем адаптер для подписки на изменения
        bookmarksAdapter.subscribeToChanges(handleBookmarkChanges);

        return () => {
            bookmarksAdapter.unsubscribeFromChanges(handleBookmarkChanges);
        };
    }, [currentFolder.id, bookmarksAdapter]);

    // Остальные useEffect остаются без изменений
    useEffect(() => {
        calculateFoldersPerPage();
        const handleResize = () => {
            calculateFoldersPerPage();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Обновляем handleFolderClick для работы с адаптером
    const handleFolderClick = async (folder) => {
        const folderIndex = currentPath.findIndex(item => item.id === folder.id);
        if (folderIndex !== -1) {
            const updatedFolder = {
                ...folder,
                children: sortBookmarks(folder.children || [])
            };
            setCurrentPath(currentPath.slice(0, folderIndex + 1));
            setCurrentFolder(updatedFolder);
        } else {
            const updatedFolder = await bookmarksAdapter.getSubTree(folder.id);
            const sortedFolder = {
                ...updatedFolder[0],
                children: sortBookmarks(updatedFolder[0].children || [])
            };
            setCurrentPath([...currentPath, sortedFolder]);
            setCurrentFolder(sortedFolder);
        }
        setCurrentPage(1);
        setSearchQuery('');
    };

    // Остальные функции и методы рендеринга остаются без изменений
    const calculateFoldersPerPage = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth - 72;
            const foldersPerRow = Math.floor(containerWidth / (FOLDER_WIDTH + FOLDER_GAP));
            const newFoldersPerPage = foldersPerRow * ROWS_TO_SHOW;
            if (newFoldersPerPage !== foldersPerPage) {
                setFoldersPerPage(newFoldersPerPage);
                setCurrentPage(prev => Math.min(prev, Math.ceil(filteredFolders.length / newFoldersPerPage)));
            }
        }
    };

    const childrenArray = useMemo(() => {
        return sortBookmarks(currentFolder.children || []);
    }, [currentFolder]);

    // Функции поиска и фильтрации остаются без изменений
    const searchInFolder = (folder, query) => {
        const results = {
            folders: [],
            bookmarks: []
        };

        if (folder.title.toLowerCase().includes(query.toLowerCase())) {
            results.folders.push(folder);
        }

        (folder.children || []).forEach(child => {
            if (child.url) {
                if (
                    child.title.toLowerCase().includes(query.toLowerCase()) ||
                    child.url.toLowerCase().includes(query.toLowerCase())
                ) {
                    results.bookmarks.push(child);
                }
            } else {
                const childResults = searchInFolder(child, query);
                results.folders.push(...childResults.folders);
                results.bookmarks.push(...childResults.bookmarks);
            }
        });

        return results;
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return {
                folders: childrenArray.filter(child => !child.url),
                bookmarks: childrenArray.filter(child => child.url)
            };
        }

        const results = searchInFolder(currentFolder, searchQuery);
        return {
            folders: sortBookmarks(results.folders),
            bookmarks: sortBookmarks(results.bookmarks)
        };
    }, [currentFolder, searchQuery, childrenArray]);

    const filteredFolders = filteredItems.folders;
    const filteredBookmarks = filteredItems.bookmarks;

    const totalPages = Math.ceil(filteredFolders.length / foldersPerPage);
    const startIndex = (currentPage - 1) * foldersPerPage;
    const endIndex = startIndex + foldersPerPage;
    const currentFolders = filteredFolders.slice(startIndex, endIndex);

    // Компоненты рендеринга остаются без изменений
    const renderBreadcrumbs = () => {
        return (
            <div className="flex items-center gap-1">
                {currentPath.map((folder, index) => (
                    <div key={folder.id} className="flex items-center">
                        <button
                            onClick={() => handleFolderClick(folder)}
                            className={`text-sm hover:text-white transition-colors ${
                                index === currentPath.length - 1 ? 'text-white font-medium' : 'text-gray-400'
                            }`}
                        >
                            <h3 className="text-lg font-semibold text-white">{folder.title}</h3>
                        </button>
                        {index < currentPath.length - 1 && (
                            <ChevronRight className="w-5 h-5 mt-1 ml-2 mr-2 text-gray-600 mx-1"/>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderFolders = () => {
        if (filteredFolders.length === 0) return null;

        return (
            <div className="mb-6" ref={containerRef}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-4">
                    {currentFolders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
                            className="flex bg-[#42414D20] flex-col items-center group hover:bg-[#52525E] p-4 rounded-md transition-colors min-h-[112px]"
                        >
                            <div className="w-20 rounded-md flex items-center justify-center mb-2">
                                <Folder className="w-10 h-10 text-[#42414D] group-hover:text-purple-400"/>
                            </div>
                            <span className="text-[13px] text-gray-300 text-center line-clamp-2">
                                {folder.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderBookmarks = () => {
        if (filteredBookmarks.length === 0) return null;

        const handleBookmarkUpdate = async () => {
            await onUpdate();
            await refreshCurrentFolder();
        };

        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mb-4">
                {filteredBookmarks.map((bookmark) => (
                    <BookmarkItem
                        key={bookmark.id}
                        bookmark={bookmark}
                        isFavorite={isFavorite}
                        onToggleFavorite={onToggleFavorite}
                        bookmarks={bookmarks}
                        onUpdate={handleBookmarkUpdate}
                    />
                ))}
            </div>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center gap-2 ml-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded-md transition-colors ${
                        currentPage === 1
                            ? 'text-gray-600'
                            : 'text-gray-400 hover:bg-[#42414D] hover:text-white'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4"/>
                </button>
                <span className="text-sm text-gray-400">
                    {currentPage}/{totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded-md transition-colors ${
                        currentPage === totalPages
                            ? 'text-gray-600'
                            : 'text-gray-400 hover:bg-[#42414D] hover:text-white'
                    }`}
                >
                    <ChevronRight className="w-4 h-4"/>
                </button>
            </div>
        );
    };

    // JSX остается без изменений
    return (
        <div id={`folder-${node.id}`} className="w-full mt-12">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-purple-500/10 rounded-md mr-3">
                    <Folder className="w-5 h-5 text-purple-400"/>
                </div>
                <div className="flex justify-between items-center flex-1">
                    <div className="flex items-center flex-1">
                        {renderBreadcrumbs()}
                    </div>
                    {filteredFolders.length > foldersPerPage && !searchQuery && renderPagination()}
                </div>
            </div>

            <div className='flex w-full justify-start'>
                <div className="relative mb-8">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        className="h-9 px-3 pl-9 bg-[#2B2A33] min-w-96 text-white placeholder-gray-400 focus:outline-none rounded-md border-none text-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                </div>
            </div>

            {searchQuery && (filteredFolders.length === 0 && filteredBookmarks.length === 0) ? (
                <div className="text-gray-400 text-sm">
                    Ничего не найдено по запросу "{searchQuery}"
                </div>
            ) : (
                <>
                    {filteredFolders.length > 0 && (
                        <>
                            {renderFolders()}
                            {filteredBookmarks.length > 0 && (
                                <div className="h-px bg-gray-700/50 mb-6"/>
                            )}
                        </>
                    )}
                    {renderBookmarks()}
                </>
            )}
        </div>
    );
};