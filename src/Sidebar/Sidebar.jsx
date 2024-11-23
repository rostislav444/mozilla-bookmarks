import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronRight, ChevronDown, Bookmark, Folder } from 'lucide-react';
import './sidebar.css';

// Компонент для отдельной папки или закладки
const BookmarkItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.children) {
    return (
      <div className="folder-item">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center w-full p-2 hover:bg-gray-700/50 rounded-lg 
            transition-colors gap-2 ${level > 0 ? 'ml-4' : ''}
          `}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <Folder className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium truncate">{item.title}</span>
        </button>
        {isOpen && (
          <div className="space-y-1">
            {item.children.map((child, index) => (
              <BookmarkItem
                key={child.id || index}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={item.url}
      className={`
        flex items-center p-2 hover:bg-gray-700/50 rounded-lg 
        transition-colors gap-2 ${level > 0 ? 'ml-4' : ''}
      `}
    >
      <Bookmark className="w-4 h-4 text-gray-400" />
      <span className="text-sm truncate">{item.title}</span>
    </a>
  );
};

// Основной компонент сайдбара
const Sidebar = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBookmarks();

    // Подписываемся на изменения закладок
    browser.bookmarks.onCreated.addListener(loadBookmarks);
    browser.bookmarks.onRemoved.addListener(loadBookmarks);
    browser.bookmarks.onChanged.addListener(loadBookmarks);
    browser.bookmarks.onMoved.addListener(loadBookmarks);

    return () => {
      // Отписываемся при размонтировании
      browser.bookmarks.onCreated.removeListener(loadBookmarks);
      browser.bookmarks.onRemoved.removeListener(loadBookmarks);
      browser.bookmarks.onChanged.removeListener(loadBookmarks);
      browser.bookmarks.onMoved.removeListener(loadBookmarks);
    };
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarkTree = await browser.bookmarks.getTree();
      setBookmarks(bookmarkTree[0].children || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  return (
    <>
      {/* Триггер для открытия */}
      <div
        className="sidebar-trigger"
        onMouseEnter={() => setIsOpen(true)}
      />

      {/* Основной контейнер сайдбара */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl 
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Закладки</h3>
        </div>

        {/* Список закладок */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-2 space-y-1">
          {bookmarks.map((item, index) => (
            <BookmarkItem
              key={item.id || index}
              item={item}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Инициализация React приложения
createRoot(document.getElementById('sidebar-root')).render(<Sidebar />);

export default Sidebar;