import {Link, Star, StarOff, Pencil} from 'lucide-react';
import {useState, useEffect} from 'react';
import BookmarkEditModal from './BookmarkEditModal';
import {useBookmarks} from '../context/BookmarksContext';
import {useTheme} from "@/App/context/ThemeContext.jsx";


const API_ENDPOINTS = {
    favicon: (hostname) => `https://external-content.duckduckgo.com/ip3/${hostname}.ico`,
    preview: (url) => url
};

const getMetaImage = async (url) => {
    try {
        // Делаем прямой запрос без прокси
        const response = await fetch(url, {
            headers: {
                'Accept': 'text/html'
            },
            mode: 'cors'  // Пробуем с CORS
        });

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Ищем изображение в порядке приоритета
        const selectors = [
            'meta[property="og:image"]',
            'meta[property="og:image:secure_url"]',
            'meta[name="og:image"]',
            'meta[property="twitter:image"]',
            'meta[name="twitter:image"]',
            'meta[property="image"]',
            'meta[name="image"]',
            'link[rel="image_src"]',
            // Добавляем поиск первого большого изображения на странице как запасной вариант
            'img[src*="preview"]',
            'img[src*="thumb"]',
            'img[src*="large"]',
            'img[width="600"]', // Ищем большие картинки
            'img[width="800"]'
        ];

        for (const selector of selectors) {
            const tag = doc.querySelector(selector);
            let imageUrl;

            if (tag.tagName === 'IMG') {
                imageUrl = tag.src;
            } else {
                imageUrl = tag?.getAttribute('content') || tag?.getAttribute('href');
            }

            if (imageUrl) {
                // Обработка относительных URL
                if (imageUrl.startsWith('//')) {
                    return `https:${imageUrl}`;
                }
                if (imageUrl.startsWith('/')) {
                    const baseUrl = new URL(url);
                    return `${baseUrl.origin}${imageUrl}`;
                }
                return imageUrl;
            }
        }

        // Если не нашли через метатеги, ищем первое подходящее изображение
        const images = doc.querySelectorAll('img');
        for (const img of images) {
            const src = img.getAttribute('src');
            if (src && !src.includes('icon') && !src.includes('logo')) {
                if (src.startsWith('/')) {
                    const baseUrl = new URL(url);
                    return `${baseUrl.origin}${src}`;
                }
                return src;
            }
        }

        return null;
    } catch (error) {
        console.error('Error in getMetaImage:', error);
        return null;
    }
};

const CACHE_TYPES = {
    FAVICON: 'favicon',
    PREVIEW: 'preview'
};

class ImageCacheManager {
    static CACHE_VERSION = 1;
    static NEGATIVE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

    static generateHash(url, type) {
        return `${type}_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
    }


    static async clearAllCache() {
        try {
            const allItems = await browser.storage.local.get();
            const cacheKeys = Object.keys(allItems).filter(key =>
                key.startsWith('favicon_') || key.startsWith('preview_')
            );

            await browser.storage.local.remove(cacheKeys);
            console.log('Cache cleared successfully');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    static async clearCache(type) {
        try {
            const allItems = await browser.storage.local.get();
            const cacheKeys = Object.keys(allItems).filter(key =>
                key.startsWith(`${type}_`)
            );

            await browser.storage.local.remove(cacheKeys);
            console.log(`${type} cache cleared successfully`);
        } catch (error) {
            console.error(`Error clearing ${type} cache:`, error);
        }
    }

    static async get(url, type) {
        const hash = this.generateHash(url, type);
        try {
            const cache = await browser.storage.local.get(hash);
            if (!cache[hash]) return null;

            const data = cache[hash];
            if (data.version !== this.CACHE_VERSION) return null;

            if (data.notFound && Date.now() - data.timestamp < this.NEGATIVE_CACHE_DURATION) {
                return 'notFound';
            }

            return data.dataUrl;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    static async set(url, type, dataUrl = null, notFound = false) {
        const hash = this.generateHash(url, type);
        try {
            const data = {
                version: this.CACHE_VERSION,
                timestamp: Date.now(),
                notFound,
                dataUrl
            };
            await browser.storage.local.set({[hash]: data});
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }
}

const blobToDataUrl = (blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
};

const useImageLoader = (url, type, hostname) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [useDefault, setUseDefault] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            try {
                if (!url || !url.trim() || url.startsWith('javascript:') ||
                    (!url.startsWith('http') && !url.startsWith('https'))) {
                    setUseDefault(true);
                    return;
                }

                const cached = await ImageCacheManager.get(url, type);

                if (cached === 'notFound') {
                    if (isMounted) setUseDefault(true);
                    return;
                }
                if (cached) {
                    if (isMounted) setImageUrl(cached);
                    return;
                }

                let dataUrl = null;

                if (type === CACHE_TYPES.FAVICON) {
                    const response = await fetch(API_ENDPOINTS.favicon(hostname), {mode: 'cors'});
                    if (response.ok) {
                        const blob = await response.blob();
                        if (blob.size > 0) {
                            dataUrl = await blobToDataUrl(blob);
                        }
                    }
                } else if (type === CACHE_TYPES.PREVIEW) {
                    console.log('Loading preview for', url);
                    const imageUrl = await getMetaImage(url);
                    if (imageUrl) {
                        try {
                            const imageResponse = await fetch(imageUrl);
                            if (imageResponse.ok) {
                                const blob = await imageResponse.blob();
                                dataUrl = await blobToDataUrl(blob);
                            }
                        } catch (error) {
                            console.error('Error loading image:', error);
                        }
                    }
                }

                if (isMounted) {
                    if (dataUrl) {
                        setImageUrl(dataUrl);
                        await ImageCacheManager.set(url, type, dataUrl);
                    } else {
                        setUseDefault(true);
                        await ImageCacheManager.set(url, type, null, true);
                    }
                }
            } catch (error) {
                console.error(`${type} load error:`, error);
                if (isMounted) {
                    setUseDefault(true);
                    setImageUrl(null);
                }
                await ImageCacheManager.set(url, type, null, true);
            }
        };

        loadImage();
        return () => {
            isMounted = false;
        };
    }, [url, type, hostname]);

    return {imageUrl, useDefault};
};

export const BookmarkItem = ({
                                 bookmark,
                                 isFavorite,
                                 onToggleFavorite,
                                 bookmarks,
                                 onUpdate
                             }) => {
    const {classes} = useTheme();
    const bookmarksAdapter = useBookmarks();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showFavicon, setShowFavicon] = useState(true);

    if (!bookmark?.url) return null;

    let cleanUrl = bookmark.url;
    if (cleanUrl.startsWith('javascript:')) {
        cleanUrl = cleanUrl.replace(/^javascript:.*$/, '');
        if (!cleanUrl) return null;
    }

    const hostname = new URL(cleanUrl).hostname.replace('www.', '');

    const {imageUrl: faviconUrl, useDefault: useDefaultIcon} = useImageLoader(
        cleanUrl,
        CACHE_TYPES.FAVICON,
        hostname
    );

    const {imageUrl: previewUrl} = useImageLoader(
        cleanUrl,
        CACHE_TYPES.PREVIEW,
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
                    className={`p-2 ${classes.surface} rounded-md ${classes.surfaceHover} transition-colors`}
                >
                    {isFavorite(bookmark.id) ? (
                        <Star className="w-4 h-4 text-yellow-400"/>
                    ) : (
                        <StarOff className={`w-4 h-4 ${classes.textSecondary}`}/>
                    )}
                </button>
                <button
                    onClick={handleOpenEditModal}
                    className={`p-2 ${classes.surface} rounded-md ${classes.surfaceHover} transition-colors`}
                >
                    <Pencil className={`w-4 h-4 ${classes.textSecondary}`}/>
                </button>
            </div>

            <a
                href={cleanUrl}
                className={`block ${classes.surface} rounded-lg hover:bg-color1-light-2 transition-all duration-300 flex flex-col h-full hover:shadow-lg hover:shadow-accent/10 overflow-hidden relative`}
                style={{
                    backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Затемняющий оверлей для читаемости текста */}
                <div className={`absolute inset-0 bg-black/40 ${previewUrl ? 'opacity-100' : 'opacity-0'}`}/>

                <div className="p-4 flex flex-col flex-grow relative z-10">
                    <div className="flex items-start justify-between mb-2">
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
                        <div
                            className={`text-[10px] ${previewUrl ? 'text-white' : classes.textSecondary} ${classes.surface} px-1.5 py-0.5 rounded-md backdrop-blur-sm`}>
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

export default BookmarkItem;