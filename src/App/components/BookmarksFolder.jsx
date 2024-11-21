import {BookmarkItem} from "@components/BookmarkItem.jsx";
import {useState} from "react";
import {ChevronRight, Folder, ChevronLeft} from 'lucide-react';

const FOLDERS_PER_PAGE = 18;

export const BookmarkFolder = ({ node, depth = 0, isFavorite, onToggleFavorite }) => {
    const [currentPath, setCurrentPath] = useState([node]);
    const [currentPage, setCurrentPage] = useState(1);

    if (!node) return null;

    const currentFolder = currentPath[currentPath.length - 1];
    const childrenArray = currentFolder.children || [];
    const folders = childrenArray.filter(child => !child.url);
    const bookmarks = childrenArray.filter(child => child.url);

    // Pagination calculations
    const totalPages = Math.ceil(folders.length / FOLDERS_PER_PAGE);
    const startIndex = (currentPage - 1) * FOLDERS_PER_PAGE;
    const endIndex = startIndex + FOLDERS_PER_PAGE;
    const currentFolders = folders.slice(startIndex, endIndex);

    const handleFolderClick = (folder) => {
        const folderIndex = currentPath.findIndex(item => item.id === folder.id);
        if (folderIndex !== -1) {
            setCurrentPath(currentPath.slice(0, folderIndex + 1));
        } else {
            setCurrentPath([...currentPath, folder]);
        }
        setCurrentPage(1);
    };

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
                            <h3 className="text-lg font-semibold text-white"> {folder.title}</h3>
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
        if (folders.length === 0) return null;

        return (
            <div className="mb-6">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                    {currentFolders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
                            className="flex bg-[#42414D20] flex-col items-center group hover:bg-[#52525E] p-2 rounded-lg transition-colors"
                        >
                            <div className="w-20 h-20 rounded-lg flex items-center justify-center mb-2">
                                <Folder className="w-12 h-12 text-[#42414D] group-hover:text-purple-400"/>
                            </div>
                            <span className="text-md text-gray-300 text-center line-clamp-2">
                                {folder.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderBookmarks = () => {
        if (bookmarks.length === 0) return null;

        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 mb-4">
                {bookmarks.map((bookmark) => (
                    <BookmarkItem
                        key={bookmark.id}
                        bookmark={bookmark}
                        isFavorite={isFavorite}
                        onToggleFavorite={onToggleFavorite}
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
                    <ChevronLeft className="w-4 h-4" />
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
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div id={`folder-${node.id}`} className="w-full mt-12">
            <div className="flex items-center gap-2 mb-8">
                <div className="p-1.5 bg-purple-500/10 rounded-md mr-3">
                    <Folder className="w-5 h-5 text-purple-400"/>
                </div>
                <div className="flex justify-between items-center flex-1">
                    {renderBreadcrumbs()}
                    {folders.length > FOLDERS_PER_PAGE && renderPagination()}
                </div>
            </div>

            {folders.length > 0 && (
                <>
                    {renderFolders()}
                    {bookmarks.length > 0 && (
                        <div className="h-px bg-gray-700/50 mb-6"/>
                    )}
                </>
            )}
            {renderBookmarks()}
        </div>
    );
};