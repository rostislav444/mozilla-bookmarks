import React, {useState, useEffect} from 'react';
import {Pencil, Trash2, FolderTree, X} from 'lucide-react';
import {Toast} from "@components/Toast.jsx";


export const BookmarkEditModal = ({bookmark, onClose, folders, onUpdate}) => {
    const [title, setTitle] = useState(bookmark.title);
    const [url, setUrl] = useState(bookmark.url);
    const [selectedFolderId, setSelectedFolderId] = useState(bookmark.parentId);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({message, type});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await browser.bookmarks.update(bookmark.id, {
                title,
                url
            });

            if (selectedFolderId !== bookmark.parentId) {
                await browser.bookmarks.move(bookmark.id, {
                    parentId: selectedFolderId
                });
            }

            await onUpdate();
            showToast('Закладка успешно обновлена');

            // Добавляем задержку перед закрытием
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error updating bookmark:', error);
            showToast('Ошибка при обновлении закладки', 'error');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить эту закладку?')) {
            try {
                await browser.bookmarks.remove(bookmark.id);
                await onUpdate();
                showToast('Закладка успешно удалена');

                // Добавляем задержку перед закрытием
                setTimeout(() => {
                    onClose();
                }, 1500);
            } catch (error) {
                console.error('Error deleting bookmark:', error);
                showToast('Ошибка при удалении закладки', 'error');
            }
        }
    };

    // Функция для рекурсивного получения всех папок
    const getAllFolders = (node) => {
        if (!node) return [];

        let result = [];

        // Если это папка (нет url) и не текущая закладка
        if (!node.url && node.id !== bookmark.id) {
            result.push(node);
        }

        // Рекурсивно обрабатываем дочерние элементы
        if (node.children) {
            node.children.forEach(child => {
                result = result.concat(getAllFolders(child));
            });
        }

        return result;
    };

    // Получаем список всех папок
    const allFolders = getAllFolders(folders);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2B2A33] rounded-lg w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Редактировать закладку</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Название
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-10 px-3 bg-[#42414D] text-white rounded-md border-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Ссылка
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full h-10 px-3 bg-[#42414D] text-white rounded-md border-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Папка
                        </label>
                        <select
                            value={selectedFolderId}
                            onChange={(e) => setSelectedFolderId(e.target.value)}
                            className="w-full h-10 px-3 bg-[#42414D] text-white rounded-md border-none focus:ring-2 focus:ring-purple-500"
                        >
                            {allFolders.map((folder) => (
                                <option
                                    key={folder.id}
                                    value={folder.id}
                                    className="bg-[#2B2A33] text-white"
                                >
                                    {folder.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2"/>
                            Удалить
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#52525E] rounded-md transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4 mr-2"/>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default BookmarkEditModal;