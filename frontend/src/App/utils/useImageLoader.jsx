// hooks/useImageLoader.js
import { useState, useEffect } from 'react';
import { blobToDataUrl, getMetaImage } from './imageUtils';
import {API_ENDPOINTS} from "@/App/constants.js";
import {ImageCacheManager} from "@/App/utils/ImageCacheManager.js";




export const useImageLoader = (url, type, hostname) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [useDefault, setUseDefault] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            try {
                if (!isValidUrl(url)) {
                    setUseDefault(true);
                    return;
                }

                const cached = await ImageCacheManager.get(url, type);
                if (handleCachedImage(cached, isMounted, setImageUrl, setUseDefault)) return;

                const dataUrl = await fetchImage(type, url, hostname);

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
        return () => { isMounted = false; };
    }, [url, type, hostname]);

    return { imageUrl, useDefault };
};

const isValidUrl = (url) => {
    return url && url.trim() && !url.startsWith('javascript:') &&
        (url.startsWith('http') || url.startsWith('https'));
};

const handleCachedImage = (cached, isMounted, setImageUrl, setUseDefault) => {
    if (cached === 'notFound') {
        if (isMounted) setUseDefault(true);
        return true;
    }
    if (cached) {
        if (isMounted) setImageUrl(cached);
        return true;
    }
    return false;
};

const fetchImage = async (type, url, hostname) => {
    if (type === 'favicon') {
        const response = await fetch(API_ENDPOINTS.favicon(hostname), { mode: 'cors' });
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return await blobToDataUrl(blob);
            }
        }
    } else if (type === 'preview') {
        const imageUrl = await getMetaImage(url);
        if (imageUrl) {
            try {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    const blob = await imageResponse.blob();
                    return await blobToDataUrl(blob);
                }
            } catch (error) {
                console.error('Error loading image:', error);
            }
        }
    }
    return null;
};