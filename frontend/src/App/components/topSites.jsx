import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { useTheme } from "@/App/context/ThemeContext.jsx";

export const TopSites = () => {
    const { classes } = useTheme();
    const [topSites, setTopSites] = useState([]);

    useEffect(() => {
        const fetchTopSites = async () => {
            try {
                // В Chrome расширениях API доступен через chrome
                chrome.topSites.get((sites) => {
                    setTopSites(sites.slice(0, 8));
                });
            } catch (error) {
                console.error('Error fetching top sites:', error);
            }
        };

        fetchTopSites();
    }, []);

    const getFaviconUrl = (url) => {
        try {
            const urlObject = new URL(url);
            return `${urlObject.protocol}//${urlObject.hostname}/favicon.ico`;
        } catch {
            return '';
        }
    };

    const getDomainFromUrl = (url) => {
        try {
            const urlObject = new URL(url);
            return urlObject.hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    if (topSites.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 w-full max-w-3xl">
            <div className="grid grid-cols-4 gap-4">
                {topSites.map((site, index) => (
                    <a
                        key={index}
                        href={site.url}
                        className={`flex flex-col items-center p-4 ${classes.surface} rounded-lg hover:bg-color3 transition-colors group`}
                    >
                        <div className={`w-12 h-12 rounded-full ${classes.surface} flex items-center justify-center mb-2 group-hover:bg-color4 transition-colors`}>
                            <img
                                src={getFaviconUrl(site.url)}
                                alt={site.title}
                                className="w-6 h-6"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <Compass
                                className={`w-6 h-6 ${classes.textSecondary} hidden`}
                            />
                        </div>
                        <span className={`text-sm ${classes.text} text-center truncate w-full`}>
                            {site.title || getDomainFromUrl(site.url)}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
};