export class ImageCacheManager {
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
        } catch (error) {
            console.error('Error clearing cache:', error);
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
            await browser.storage.local.set({
                [hash]: {
                    version: this.CACHE_VERSION,
                    timestamp: Date.now(),
                    notFound,
                    dataUrl
                }
            });
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }
}
