import {Link, Star, StarOff, Pencil} from 'lucide-react';
import {useState, useEffect} from 'react';
import BookmarkEditModal from './BookmarkEditModal';
import {useBookmarks} from '../context/BookmarksContext';

export const BookmarkItem = ({
                                 bookmark,
                                 isFavorite,
                                 onToggleFavorite,
                                 bookmarks,
                                 onUpdate
                             }) => {
    const bookmarksAdapter = useBookmarks();
    const [faviconUrl, setFaviconUrl] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!bookmark?.url) return null;

    const hostname = new URL(bookmark.url).hostname.replace('www.', '');

    useEffect(() => {
        const getFavicon = () => {
            setFaviconUrl(`https://external-content.duckduckgo.com/ip3/${hostname}.ico`);
        };
        getFavicon();
    }, [hostname]);

    useEffect(() => {
        const checkBookmark = async () => {
            try {
                // Используем адаптер вместо прямого обращения к browser.bookmarks
                await bookmarksAdapter.get(bookmark.id);
            } catch (error) {
                // Если закладка не найдена, вызываем обновление
                onUpdate();
            }
        };
        checkBookmark();
    }, [bookmark.id, bookmarksAdapter]);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        onToggleFavorite(bookmark);
    };

    const handleOpenEditModal = (e) => {
        e.preventDefault();
        setIsEditModalOpen(true);
    };

    return (
        <div className="relative group h-[180px]">
            <div
                className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={handleToggleFavorite}
                    className="p-2 bg-[#2B2A33] rounded-md hover:bg-[#42414D] transition-colors"
                >
                    {isFavorite(bookmark.id) ? (
                        <Star className="w-4 h-4 text-yellow-400"/>
                    ) : (
                        <StarOff className="w-4 h-4 text-gray-400"/>
                    )}
                </button>
                <button
                    onClick={handleOpenEditModal}
                    className="p-2 bg-[#2B2A33] rounded-md hover:bg-[#42414D] transition-colors"
                >
                    <Pencil className="w-4 h-4 text-gray-400"/>
                </button>
            </div>

            <a
                href={bookmark.url}
                className="block bg-[#2B2A33] p-4 rounded-lg hover:bg-[#52525E] transition-all duration-300 flex flex-col h-full hover:shadow-lg hover:shadow-blue-500/10"
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                        {faviconUrl ? (
                            <img
                                src={faviconUrl}
                                alt={`${hostname} favicon`}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <Link
                            className="w-4 h-4 text-blue-400"
                            style={{display: faviconUrl ? 'none' : 'block'}}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-400 bg-[#42414D] px-1.5 py-0.5 rounded-md">
                            {hostname}
                        </div>
                    </div>
                </div>
                <h4 className="text-base font-medium text-white mb-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {bookmark.title || 'Без названия'}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2 mt-auto overflow-hidden text-ellipsis">
                    {bookmark.url}
                </p>
            </a>

            {isEditModalOpen && (
                <BookmarkEditModal
                    bookmark={bookmark}
                    folders={bookmarks}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={onUpdate}
                    bookmarksAdapter={bookmarksAdapter} // Передаем адаптер в модальное окно
                />
            )}
        </div>
    );
};