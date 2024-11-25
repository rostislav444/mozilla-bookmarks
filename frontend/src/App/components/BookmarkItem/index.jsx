// components/BookmarkItem.jsx
import React, { useState, useEffect } from 'react';
import { Link, Star, StarOff, Pencil } from 'lucide-react';
import { useTheme } from "@/App/context/ThemeContext.jsx";
import BookmarkEditModal from '../BookmarkEditModal';
import {ImageCacheManager as bookmarksAdapter} from "@/App/utils/ImageCacheManager.js";
import {useImageLoader} from "@/App/utils/useImageLoader.jsx";

const FaviconDisplay = ({
    faviconUrl,
    useDefaultIcon,
    showFavicon,
    setShowFavicon,
    hostname,
    classes
}) => (
    <div className="p-1.5 bg-accent/10 backdrop-blur-sm rounded-md">
        {!useDefaultIcon && faviconUrl && showFavicon ? (
            <img
                src={faviconUrl}
                alt={`${hostname} favicon`}
                className="w-4 h-4 object-contain"
                onError={() => setShowFavicon(false)}
            />
        ) : (
            <Link className={`w-4 h-4 ${classes.accentText}`}/>
        )}
    </div>
);


export const BookmarkItem = ({
    bookmark,
    isFavorite,
    onToggleFavorite,
    bookmarks,
    onUpdate
}) => {
    const { classes } = useTheme();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showFavicon, setShowFavicon] = useState(true);

    if (!isValidBookmark(bookmark)) return null;

    const { cleanUrl, hostname } = getUrlInfo(bookmark.url);
    if (!cleanUrl) return null;

    const { imageUrl: faviconUrl, useDefault: useDefaultIcon } = useImageLoader(
        cleanUrl,
        'favicon',
        hostname
    );

    const { imageUrl: previewUrl } = useImageLoader(
        cleanUrl,
        'preview',
        hostname
    );

    useEffect(() => {
        const checkBookmark = async () => {
            try {
                await bookmarksAdapter.get(bookmark.id);
            } catch {
                onUpdate();
            }
        };
        checkBookmark();
    }, [bookmark.id, bookmarksAdapter, onUpdate]);

    return (
        <div className="relative group h-[180px]">
            <BookmarkActions
                isFavorite={isFavorite}
                bookmark={bookmark}
                onToggleFavorite={onToggleFavorite}
                onEdit={() => setIsEditModalOpen(true)}
                classes={classes}
            />

            <BookmarkContent
                cleanUrl={cleanUrl}
                hostname={hostname}
                previewUrl={previewUrl}
                faviconUrl={faviconUrl}
                useDefaultIcon={useDefaultIcon}
                showFavicon={showFavicon}
                setShowFavicon={setShowFavicon}
                bookmark={bookmark}
                classes={classes}
            />

            {isEditModalOpen && (
                <BookmarkEditModal
                    bookmark={bookmark}
                    folders={bookmarks}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={onUpdate}
                    bookmarksAdapter={bookmarksAdapter}
                />
            )}
        </div>
    );
};

const isValidBookmark = (bookmark) => bookmark?.url;

const getUrlInfo = (url) => {
    if (url.startsWith('javascript:')) {
        const cleanUrl = url.replace(/^javascript:.*$/, '');
        if (!cleanUrl) return { cleanUrl: null, hostname: null };
        url = cleanUrl;
    }

    const urlObj = new URL(url);
    return {
        cleanUrl: url,
        hostname: urlObj.hostname.replace('www.', '')
    };
};

const BookmarkActions = ({ isFavorite, bookmark, onToggleFavorite, onEdit, classes }) => (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button
            onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(bookmark);
            }}
            className={`p-2 ${classes.surface} rounded-md ${classes.surfaceHover} transition-colors`}
        >
            {isFavorite(bookmark.id) ? (
                <Star className="w-4 h-4 text-yellow-400"/>
            ) : (
                <StarOff className={`w-4 h-4 ${classes.textSecondary}`}/>
            )}
        </button>
        <button
            onClick={(e) => {
                e.preventDefault();
                onEdit();
            }}
            className={`p-2 ${classes.surface} rounded-md ${classes.surfaceHover} transition-colors`}
        >
            <Pencil className={`w-4 h-4 ${classes.textSecondary}`}/>
        </button>
    </div>
);

const BookmarkContent = ({
    cleanUrl,
    hostname,
    previewUrl,
    faviconUrl,
    useDefaultIcon,
    showFavicon,
    setShowFavicon,
    bookmark,
    classes
}) => (
    <a
        href={cleanUrl}
        className={`block ${classes.surface} rounded-lg hover:bg-color1-light-2 transition-all duration-300 flex flex-col h-full hover:shadow-lg hover:shadow-accent/10 overflow-hidden relative`}
        style={{
            backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        <div className={`absolute inset-0 bg-black/40 ${previewUrl ? 'opacity-100' : 'opacity-0'}`}/>

        <div className="p-4 flex flex-col flex-grow relative z-10">
            <div className="flex items-start justify-between mb-2">
                <FaviconDisplay
                    faviconUrl={faviconUrl}
                    useDefaultIcon={useDefaultIcon}
                    showFavicon={showFavicon}
                    setShowFavicon={setShowFavicon}
                    hostname={hostname}
                    classes={classes}
                />
                <div className={`text-[10px] ${previewUrl ? 'text-white' : classes.textSecondary} ${classes.surface} px-1.5 py-0.5 rounded-md backdrop-blur-sm group-hover:hidden`}>
                    {hostname}
                </div>
            </div>

            <h4 className={`text-base font-medium ${previewUrl ? 'text-white' : classes.text} mb-1.5 line-clamp-2 transition-colors`}>
                {bookmark.title || 'Без названия'}
            </h4>

            <p className={`${previewUrl ? 'text-white/80' : classes.textSecondary} text-xs line-clamp-2 mt-auto overflow-hidden text-ellipsis`}>
                {cleanUrl}
            </p>
        </div>
    </a>
);


export default BookmarkItem;