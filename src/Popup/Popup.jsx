import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {FolderSelect} from './components/FolderSelect';
import {BookmarkForm} from './components/BookmarkForm';
import './styles/popup.css';

const Popup = () => {
    const [currentTab, setCurrentTab] = useState(null);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [title, setTitle] = useState('');

    useEffect(() => {
        // Получаем информацию о текущей вкладке
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            setCurrentTab(tabs[0]);
            setTitle(tabs[0].title);
        });

        // Загружаем структуру папок
        loadBookmarkFolders();
    }, []);

    const loadBookmarkFolders = async () => {
        const bookmarkItems = await browser.bookmarks.getTree();
        let toolbarFolderId = null;

        // Функция для поиска папки "Панель закладок"
        const findToolbarFolder = (nodes) => {
            for (const node of nodes) {
                if (node.type === 'folder' && node.title === 'Панель закладок') {
                    toolbarFolderId = node.id;
                    return true;
                }
                if (node.children && findToolbarFolder(node.children)) {
                    return true;
                }
            }
            return false;
        };

        const extractFolders = (nodes, result = []) => {
            nodes.forEach(node => {
                if (node.type === 'folder') {
                    result.push({
                        id: node.id,
                        title: node.title,
                        children: []
                    });
                    if (node.children) {
                        extractFolders(node.children, result[result.length - 1].children);
                    }
                }
            });
            return result;
        };

        // Сначала ищем папку "Панель закладок"
        findToolbarFolder(bookmarkItems);

        // Затем извлекаем все папки и устанавливаем состояния
        const extractedFolders = extractFolders(bookmarkItems[0].children);
        setFolders(extractedFolders);

        // Автоматически выбираем папку "Панель закладок"
        if (toolbarFolderId) {
            setSelectedFolder(toolbarFolderId);
        }
    };

    const handleSave = async () => {
        if (!selectedFolder || !currentTab) return;

        try {
            await browser.bookmarks.create({
                parentId: selectedFolder,
                title: title,
                url: currentTab.url
            });
            window.close();
        } catch (error) {
            console.error('Error saving bookmark:', error);
        }
    };

    return (
        <div className="min-w-[300px] p-4 bg-gray-900 text-white">
            <BookmarkForm
                title={title}
                onTitleChange={(e) => setTitle(e.target.value)}
                onSave={handleSave}
                disabled={!selectedFolder}
            />

            <div className="mt-4">
                <label className="block text-sm mb-1">Папка</label>
                <FolderSelect
                    folders={folders}
                    selectedFolder={selectedFolder}
                    onSelect={setSelectedFolder}
                />
            </div>
        </div>
    );
};

// Инициализация React приложения
createRoot(document.getElementById('popup-root')).render(<Popup/>);