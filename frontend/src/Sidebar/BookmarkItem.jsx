import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const CACHE_VERSION = 1; // Для возможности инвалидации кеша в будущем
const NEGATIVE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней для отсутствующих иконок

const FaviconCache = {
    async get(url) {
        const hash = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
        try {
            const cache = await browser.storage.local.get(hash);
            if (!cache[hash]) return null;

            const data = cache[hash];

            // Проверяем версию кеша
            if (data.version !== CACHE_VERSION) return null;

            // Проверяем отрицательный кеш
            if (data.notFound) {
                if (Date.now() - data.timestamp < NEGATIVE_CACHE_DURATION) {
                    return 'notFound';
                }
                return null;
            }

            return data.dataUrl;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },

    async set(url, dataUrl = null, notFound = false) {
        const hash = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
        try {
            const data = {
                version: CACHE_VERSION,
                timestamp: Date.now(),
                notFound,
                dataUrl
            };
            await browser.storage.local.set({ [hash]: data });
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }
};

export const BookmarkItem = ({ url }) => {
    const [iconUrl, setIconUrl] = useState(null);
    const [useDefaultIcon, setUseDefaultIcon] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadFavicon = async () => {
            try {
                // Проверяем кеш
                const cached = await FaviconCache.get(url);
                if (cached === 'notFound') {
                    if (isMounted) setUseDefaultIcon(true);
                    return;
                }
                if (cached) {
                    if (isMounted) setIconUrl(cached);
                    return;
                }

                const domain = new URL(url).hostname;

                // Список надежных доменов и их favicon
                const knownDomains = {
                    'github.com': 'https://github.com/favicon.ico',
                    'google.com': 'https://www.google.com/favicon.ico',
                };

                // Пробуем разные варианты favicon
                const possibleUrls = [
                    knownDomains[domain],
                    `https://${domain}/favicon.ico`,
                    `https://${domain}/favicon.png`,
                    `https://${domain}/assets/favicon.ico`,
                ];

                let dataUrl = null;
                for (const faviconUrl of possibleUrls.filter(Boolean)) {
                    try {
                        const response = await fetch(faviconUrl, {
                            method: 'GET',
                            mode: 'cors',
                            credentials: 'omit' // Избегаем проблем с куками
                        });

                        if (!response.ok) continue;

                        const blob = await response.blob();
                        if (blob.size === 0) continue;

                        dataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        break; // Прерываем цикл, если нашли работающую иконку
                    } catch (e) {
                        continue; // Пробуем следующий URL
                    }
                }

                if (dataUrl && isMounted) {
                    setIconUrl(dataUrl);
                    await FaviconCache.set(url, dataUrl);
                } else {
                    if (isMounted) setUseDefaultIcon(true);
                    await FaviconCache.set(url, null, true); // Кешируем отсутствие иконки
                }
            } catch (error) {
                console.error('Favicon load error:', error);
                if (isMounted) {
                    setUseDefaultIcon(true);
                    await FaviconCache.set(url, null, true);
                }
            }
        };

        loadFavicon();
        return () => {
            isMounted = false;
        };
    }, [url]);

    return (
        <div className="w-4 h-4 relative flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
                {useDefaultIcon || !iconUrl ? (
                    <Globe className="w-4 h-4 text-gray-400" />
                ) : (
                    <img
                        src={iconUrl}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={() => {
                            setUseDefaultIcon(true);
                            FaviconCache.set(url, null, true);
                        }}
                        loading="lazy"
                    />
                )}
            </div>
        </div>
    );
};