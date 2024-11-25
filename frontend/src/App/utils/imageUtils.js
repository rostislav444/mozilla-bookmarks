import {META_IMAGE_SELECTORS} from "@/App/constants.js";


export const blobToDataUrl = (blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
};

const normalizeImageUrl = (imageUrl, baseUrl) => {
    if (imageUrl.startsWith('//')) {
        return `https:${imageUrl}`;
    }
    if (imageUrl.startsWith('/')) {
        const baseUrlObj = new URL(baseUrl);
        return `${baseUrlObj.origin}${imageUrl}`;
    }
    return imageUrl;
};


export const getMetaImage = async (url) => {
    const CORS_PROXIES = [
        url => url,
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        (url) => `https://cors-anywhere.herokuapp.com/${url}`,
    ];

    for (const proxyGenerator of CORS_PROXIES) {
        try {
            const proxyUrl = proxyGenerator(url);
            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'text/html',
                    'Origin': window.location.origin,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                mode: 'cors'
            });

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Try meta selectors first
            for (const selector of META_IMAGE_SELECTORS) {
                const tag = doc.querySelector(selector);
                if (!tag) continue;

                const imageUrl = tag.tagName === 'IMG'
                    ? tag.src
                    : tag?.getAttribute('content') || tag?.getAttribute('href');

                if (imageUrl) {
                    return normalizeImageUrl(imageUrl, url);
                }
            }

            // Fallback to first suitable image
            const images = doc.querySelectorAll('img');
            for (const img of images) {
                const src = img.getAttribute('src');
                if (src && !src.includes('icon') && !src.includes('logo')) {
                    return normalizeImageUrl(src, url);
                }
            }

        } catch (error) {
            console.log(`Proxy ${proxyGenerator(url)} failed:`, error);
            continue; // пробуем следующий прокси
        }
    }

    console.error('All proxies failed');
    return null;
};