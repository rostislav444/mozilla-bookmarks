import React, {useEffect, useState, useRef} from "react";
import {Edit, Link as LinkIcon, Plus, Star, Trash, X} from "lucide-react";
import {ReactSortable} from "react-sortablejs";

const WebsiteIcon = ({url}) => {
    const [iconLoaded, setIconLoaded] = useState(false);
    const [iconError, setIconError] = useState(false);
    const domain = new URL(url).hostname;
    const iconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

    const handleError = () => {
        setIconError(true);
        setIconLoaded(false);
    };

    return (
        <div className="p-1.5 bg-blue-500/10 rounded-md relative w-7 h-7 flex items-center justify-center">
            {(!iconLoaded || iconError) && <LinkIcon className="w-4 h-4 text-gray-400 absolute"/>}
            {!iconError && (
                <img
                    src={iconUrl}
                    alt={`${domain} icon`}
                    className={`w-4 h-4 object-contain absolute transition-opacity duration-200 ${
                        iconLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => {
                        setIconLoaded(true);
                        setIconError(false);
                    }}
                    onError={handleError}
                    loading="lazy"
                />
            )}
        </div>
    );
};

const QuickLinkItem = ({link, onEdit, onDelete}) => {
    return (
        <div
            className="relative group bg-[#2B2A33] p-4 rounded-md hover:bg-[#42414D] transition-all duration-300 flex flex-col h-[120px]">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(link);
                    }}
                    className="p-1.5 bg-[#2B2A33] rounded-md hover:bg-[#52525E]"
                >
                    <Edit className="w-3.5 h-3.5 text-gray-300"/>
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(link.id);
                    }}
                    className="p-1.5 bg-red-500/20 rounded-md hover:bg-red-500/30"
                >
                    <Trash className="w-3.5 h-3.5 text-red-400"/>
                </button>
            </div>
            <a href={link.url} className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <WebsiteIcon url={link.url}/>
                    <div className="flex items-center gap-2">
                        <div
                            className="text-[10px] text-gray-400 bg-[#42414D] px-1.5 py-0.5 rounded-md opacity-100 group-hover:opacity-0 translate-y-0 group-hover:-translate-y-1 transition-all duration-200">
                            {new URL(link.url).hostname.replace('www.', '')}
                        </div>
                    </div>
                </div>
                <h4 className="text-[16px] text-white mb-0.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {link.title}
                </h4>
                <p className="text-gray-400 text-[12px] line-clamp-2 overflow-hidden text-ellipsis">
                    {link.url}
                </p>
            </a>
        </div>
    );
};

const LinkModal = ({isOpen, onClose, onSave, editingLink = null}) => {
    const [title, setTitle] = useState(editingLink?.title || '');
    const [url, setUrl] = useState(editingLink?.url || '');

    useEffect(() => {
        setTitle(editingLink?.title || '');
        setUrl(editingLink?.url || '');
    }, [editingLink]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: editingLink?.id || Date.now().toString(),
            title,
            url
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#2B2A33] rounded-lg p-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-white">
                        {editingLink ? 'Редактировать ссылку' : 'Добавить ссылку'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-300">Название</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 w-full bg-[#42414D] border border-gray-600 rounded-md px-2.5 py-1.5 text-sm text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-300">URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="mt-1 w-full bg-[#42414D] border border-gray-600 rounded-md px-2.5 py-1.5 text-sm text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 bg-[#42414D] hover:bg-[#52525E] rounded-md text-sm text-white"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md text-sm text-white"
                            >
                                {editingLink ? 'Сохранить' : 'Добавить'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('quickLinks');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const updateFavorites = (newFavorites) => {
        setFavorites(newFavorites);
        localStorage.setItem('quickLinks', JSON.stringify(newFavorites));
    };

    const addToFavorites = (bookmark) => {
        if (!favorites.some(fav => fav.id === bookmark.id)) {
            const newFavorite = {
                id: bookmark.id,
                title: bookmark.title,
                url: bookmark.url
            };
            updateFavorites([...favorites, newFavorite]);
        }
    };

    const removeFromFavorites = (bookmarkId) => {
        updateFavorites(favorites.filter(fav => fav.id !== bookmarkId));
    };

    const isFavorite = (bookmarkId) => {
        return favorites.some(fav => fav.id === bookmarkId);
    };

    return {favorites, addToFavorites, removeFromFavorites, isFavorite, updateFavorites};
};

export const QuickLinks = ({favorites, updateFavorites}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);

    const handleSaveLink = (link) => {
        try {
            new URL(link.url);
            if (editingLink) {
                const updatedLinks = favorites.map(l =>
                    l.id === link.id ? link : l
                );
                updateFavorites(updatedLinks);
            } else {
                updateFavorites([...favorites, link]);
            }
            setEditingLink(null);
        } catch (error) {
            console.error('Invalid URL:', error);
            alert('Please enter a valid URL');
        }
    };

    const handleEditLink = (link) => {
        setEditingLink(link);
        setIsModalOpen(true);
    };

    const handleDeleteLink = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту ссылку?')) {
            updateFavorites(favorites.filter(link => link.id !== id));
        }
    };

    return (
        <>
            <div className="w-full mt-12 mb-6">
                <div className="flex items-center mb-8">
                    <div className="flex w-full justify-between gap-2">
                        <div className="flex">
                            <div className="p-1.5 bg-blue-500/10 rounded-sm">
                                <Star className="w-5 h-5 text-yellow-400"/>
                            </div>
                            <h3 className="text-lg ml-4 font-semibold text-white">Быстрые ссылки</h3>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="ml-2 p-1.5 bg-gray-500/10 rounded-md hover:bg-gray-500/20 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-gray-400"/>
                        </button>
                    </div>
                </div>
                <ReactSortable
                    list={favorites}
                    setList={updateFavorites}
                    className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4"
                    animation={200}
                    delay={2}
                    delayOnTouchOnly={true}
                >
                    {favorites.map((link) => (
                        <QuickLinkItem
                            key={link.id}
                            link={link}
                            onEdit={handleEditLink}
                            onDelete={handleDeleteLink}
                        />
                    ))}
                </ReactSortable>
            </div>

            <LinkModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingLink(null);
                }}
                onSave={handleSaveLink}
                editingLink={editingLink}
            />
        </>
    );
};