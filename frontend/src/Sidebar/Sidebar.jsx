import React, {useEffect, useState} from 'react';
import {ChevronDown, ChevronRight, Folder, Search, Star, X} from 'lucide-react';
import {BookmarkItem} from './BookmarkItem';
import {QuickLinkItem} from './QuickLinkItem';

const matchesSearch = (node, searchQuery) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = node.title?.toLowerCase().includes(query);
    const urlMatch = node.url?.toLowerCase().includes(query);

    if (titleMatch || urlMatch) return true;

    // Проверяем детей
    if (node.children) {
        return node.children.some(child => matchesSearch(child, query));
    }

    return false;
};

const TreeNode = ({node, level = 0, openFolders, setOpenFolders, searchQuery}) => {
    const isOpen = openFolders.has(node.id);
    const matches = matchesSearch(node, searchQuery);

    if (!matches) return null;

    const handleToggle = () => {
        const newOpenFolders = new Set(openFolders);
        if (isOpen) {
            newOpenFolders.delete(node.id);
        } else {
            newOpenFolders.add(node.id);
        }
        setOpenFolders(newOpenFolders);
    };

    const isFolder = (item) => {
        return item.type === 'folder' || !item.url;
    };

    const sortedChildren = React.useMemo(() => {
        if (!node.children) return [];

        const folders = node.children.filter(isFolder);
        const bookmarks = node.children.filter(item => !isFolder(item));

        const sortedFolders = folders.sort((a, b) => a.title.localeCompare(b.title));
        const sortedBookmarks = bookmarks.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));

        return [...sortedFolders, ...sortedBookmarks];
    }, [node.children]);

    if (!isFolder(node)) {
        return (
            <a
                href={node.url}
                onClick={(e) => {
                    e.preventDefault();
                    window.parent.location.href = node.url;
                }}
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-700/50 rounded-md ml-6 text-[13px] text-gray-300 hover:text-white transition-colors"
            >
                <BookmarkItem url={node.url}/>
                <span className="truncate">{node.title}</span>
            </a>
        );
    }

    // Если это папка и в ней нет соответствующих поиску элементов, не показываем её
    if (searchQuery && !node.children?.some(child => matchesSearch(child, searchQuery))) {
        return null;
    }

    return (
        <div>
            <button
                onClick={handleToggle}
                className={`
                    flex items-center w-full gap-1.5 py-1.5 px-2 hover:bg-gray-700/50 rounded-md
                    ${level > 0 ? 'ml-4' : ''} transition-colors
                `}
            >
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400"/>
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400"/>
                )}
                <Folder className="w-4 h-4 text-gray-400"/>
                <span className="text-sm text-gray-300 truncate font-medium">{node.title}</span>
            </button>
            {isOpen && sortedChildren.length > 0 && (
                <div className="ml-2">
                    {sortedChildren.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            openFolders={openFolders}
                            setOpenFolders={setOpenFolders}
                            searchQuery={searchQuery}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const Sidebar = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openFolders, setOpenFolders] = useState(new Set());

    useEffect(() => {
        loadBookmarks();
        loadFavorites();

        window.addEventListener('BOOKMARKS_UPDATED', loadBookmarks);
        return () => {
            window.removeEventListener('BOOKMARKS_UPDATED', loadBookmarks);
        };
    }, []);


    // При поиске автоматически открываем папки, содержащие результаты
    useEffect(() => {
        if (searchQuery) {
            const newOpenFolders = new Set(openFolders);
            const addMatchingFolders = (nodes) => {
                nodes.forEach(node => {
                    if (node.children) {
                        if (node.children.some(child => matchesSearch(child, searchQuery))) {
                            newOpenFolders.add(node.id);
                        }
                        addMatchingFolders(node.children);
                    }
                });
            };
            addMatchingFolders(bookmarks);
            setOpenFolders(newOpenFolders);
        } else {
            // Когда поисковый запрос пустой, закрываем все папки
            setOpenFolders(new Set());
        }
    }, [searchQuery, bookmarks]); // добавил bookmarks в зависимости

    const loadBookmarks = async () => {
        try {
            const response = await browser.runtime.sendMessage({type: 'GET_BOOKMARKS'});
            if (response?.bookmarks) {
                const toolbarFolder = response.bookmarks[0]?.children?.find(
                    child => child.title === "Панель закладок" || child.id === "toolbar_____"
                );

                if (toolbarFolder?.children) {
                    const folders = toolbarFolder.children.filter(item => item.type === 'folder' || !item.url);
                    const bookmarks = toolbarFolder.children.filter(item => item.type !== 'folder' && item.url);

                    const sortedFolders = folders.sort((a, b) => a.title.localeCompare(b.title));
                    const sortedBookmarks = bookmarks.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));

                    setBookmarks([...sortedFolders, ...sortedBookmarks]);
                }
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const loadFavorites = () => {
        const savedFavorites = localStorage.getItem('quickLinks');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    };

    return (
        <div
            className="h-full bg-[#1C1B22] text-white w-[400px] overflow-y-auto [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="p-4 border-b border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск закладок..."
                        className="w-full bg-gray-800 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2"
                        >
                            <X className="w-4 h-4 text-gray-400"/>
                        </button>
                    ) : (
                        <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"/>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-60px)]">
                {favorites.length > 0 && (
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-yellow-400"/>
                            <h3 className="text-sm font-medium text-white">Быстрые ссылки</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {favorites.map((link) => (
                                <QuickLinkItem key={link.id} link={link}/>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Folder className="w-4 h-4 text-purple-400"/>
                        <h3 className="text-sm font-medium text-white">Панель закладок</h3>
                    </div>
                    {bookmarks.map((bookmark) => (
                        <TreeNode
                            key={bookmark.id}
                            node={bookmark}
                            openFolders={openFolders}
                            setOpenFolders={setOpenFolders}
                            searchQuery={searchQuery}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};