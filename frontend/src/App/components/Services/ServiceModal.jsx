import React, {useState, useEffect} from 'react';
import * as LucideIcons from 'lucide-react';
import {X, Search, Link as LinkIcon} from 'lucide-react';

const IconSelector = ({selectedIcon, onSelect}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Получаем все иконки из lucide-react
    const icons = Object.entries(LucideIcons)
        .filter(([name]) =>
            name !== 'createLucideIcon' &&
            name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 100); // Ограничиваем количество отображаемых иконок для производительности

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white hover:bg-gray-600"
            >
                {selectedIcon ? (
                    <>
                        {React.createElement(LucideIcons[selectedIcon], {size: 20})}
                        <span>{selectedIcon}</span>
                    </>
                ) : (
                    <span>Выберите иконку</span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 mt-1 w-full max-h-[300px] overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                    <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4"/>
                            <input
                                type="text"
                                placeholder="Поиск иконок..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 p-2">
                        {icons.map(([name, Icon]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    onSelect(name);
                                    setIsOpen(false);
                                }}
                                className={`p-2 rounded flex flex-col items-center gap-1 hover:bg-gray-700 ${
                                    selectedIcon === name ? 'bg-gray-700' : ''
                                }`}
                            >
                                <Icon size={20} className="text-gray-300"/>
                                <span className="text-xs text-gray-400 truncate w-full text-center">
                                    {name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ServiceModal = ({isOpen, onClose, onSave, editingService = null}) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState('');
    const [selectedLucideIcon, setSelectedLucideIcon] = useState('');

    useEffect(() => {
        if (editingService) {
            setName(editingService.name);
            setUrl(editingService.url);
            setIcon(editingService.icon || '');
            setSelectedLucideIcon(editingService.lucideIcon || '');
        } else {
            setName('');
            setUrl('');
            setIcon('');
            setSelectedLucideIcon('');
        }
    }, [editingService]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: editingService?.id || Date.now().toString(),
            name,
            url,
            icon,
            lucideIcon: selectedLucideIcon
        });
        setName('');
        setUrl('');
        setIcon('');
        setSelectedLucideIcon('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70]">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">
                        {editingService ? 'Редактировать сервис' : 'Добавить сервис'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Название</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Иконка
                        </label>
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="url"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="URL иконки (необязательно)"
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                                <LinkIcon className="w-5 h-5 text-gray-400"/>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">или</div>
                            <IconSelector
                                selectedIcon={selectedLucideIcon}
                                onSelect={setSelectedLucideIcon}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                        >
                            {editingService ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};