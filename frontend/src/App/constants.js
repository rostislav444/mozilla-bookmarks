// constants.js

export const API_ENDPOINTS = {
    favicon: (hostname) => `https://external-content.duckduckgo.com/ip3/${hostname}.ico`,
    preview: (url) => url
};

export const META_IMAGE_SELECTORS = [
    'meta[property="og:image"]',       // Самый распространенный формат
    'meta[property="og:image:secure_url"]',
    'meta[name="og:image"]',
    'meta[property="twitter:image"]',
    'meta[name="twitter:image"]',
    'meta[property="image"]',
    'meta[name="image"]',
    'link[rel="image_src"]',
    // Остальные селекторы как запасной вариант
    'img[src*="preview"]',
    'img[src*="thumb"]',
    'img[src*="large"]'
];