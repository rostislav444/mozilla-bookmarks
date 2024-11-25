import React, {useEffect, useState, useRef} from "react";
import {Edit, Folder, Link as LinkIcon, Plus, Star, Trash, X} from "lucide-react";
import {ReactSortable} from "react-sortablejs";
import {useTheme} from "@/App/context/ThemeContext.jsx";

const WebsiteIcon = ({url}) => {
    const {classes} = useTheme();
    const [iconLoaded, setIconLoaded] = useState(false);
    const [iconError, setIconError] = useState(false);
    const domain = new URL(url).hostname;
    const iconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

    const handleError = () => {
        setIconError(true);
        setIconLoaded(false);
    };

    return (
        <div className="relative w-8 h-8 flex items-center justify-center bg-accent/10 rounded-lg overflow-hidden">
            {(!iconLoaded || iconError) && (
                <LinkIcon className={`w-5 h-5 ${classes.textSecondary}`} />
            )}
            {!iconError && (
                <img
                    src={iconUrl}
                    alt={`${domain} icon`}
                    className={`w-8 h-8 object-contain transition-opacity duration-200 ${
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
    const {classes} = useTheme();

    const getDomainFromUrl = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    return (
        <div className={`relative group ${classes.surface} py-5 px-4 rounded-md hover:bg-color1-light-2 transition-all duration-300`}>
            {/* Action buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(link);
                    }}
                    className={`p-1.5 ${classes.surface} rounded-md hover:bg-color4 transition-colors`}
                >
                    <Edit className={`w-3.5 h-3.5 ${classes.text}`}/>
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(link.id);
                    }}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                >
                    <Trash className="w-3.5 h-3.5 text-red-400"/>
                </button>
            </div>

            <a href={link.url} className="flex items-center space-x-4">
                <WebsiteIcon url={link.url} />
                <div className="flex-1 min-w-0 ml-1 pb-1.5">
                    <h4 className={`text-base ${classes.text} line-clamp-1 group-hover:text-accent transition-colors`}>
                        {link.title}
                    </h4>
                    <p className={`${classes.textSecondary} text-xs line-clamp-1 mt-0.5`}>
                        {link.url}
                    </p>
                </div>
            </a>
        </div>
    );
};

const LinkModal = ({isOpen, onClose, onSave, editingLink = null}) => {
    const {classes} = useTheme();
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
            <div className={`${classes.surface} rounded-lg p-4 w-full max-w-sm`}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-base font-semibold ${classes.text}`}>
                        {editingLink ? 'Редактировать ссылку' : 'Добавить ссылку'}
                    </h3>
                    <button onClick={onClose} className={`${classes.textSecondary} hover:${classes.text}`}>
                        <X className="w-4 h-4"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label className={`block text-xs font-medium ${classes.textSecondary}`}>Название</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`mt-1 w-full bg-color3 border ${classes.border} rounded-md px-2.5 py-1.5 text-sm ${classes.text}`}
                                required
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium ${classes.textSecondary}`}>URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={`mt-1 w-full bg-color3 border ${classes.border} rounded-md px-2.5 py-1.5 text-sm ${classes.text}`}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-3 py-1.5 bg-color3 hover:bg-color4 rounded-md text-sm ${classes.text}`}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-accent hover:bg-accent/90 rounded-md text-sm text-white"
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
    const {classes} = useTheme();
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
                <div className="flex items-center mb-6">
                    <div className="flex w-full justify-between gap-2">
                        <div className="flex">
                            <div className="p-1.5 bg-yellow-500/10 rounded-md mr-3">
                                <Star className="w-5 h-5 text-yellow-400"/>
                            </div>

                            <h3 className={`text-lg ml-4 font-semibold ${classes.text}`}>Быстрые ссылки</h3>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="ml-2 p-1.5 bg-color3/50 rounded-md hover:bg-color1-light-2 transition-colors"
                        >
                            <Plus className={`w-5 h-5 ${classes.textSecondary}`}/>
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