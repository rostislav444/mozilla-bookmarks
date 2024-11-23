import {Link as LinkIcon} from "lucide-react";
import React, {useState} from "react";


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


export const LinkItem = ({children, link, isBookmark = false}) => {
    return (
        <div
            className={`relative group bg-[#2B2A33] p-4 rounded-md hover:bg-[#42414D] transition-all duration-300 flex flex-col h-[${isBookmark ? 164 : 120}px]`}>
            <div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-50">
                {children}
            </div>
            <a href={link.url} className="flex flex-col h-full z-10">
                <div className="flex items-start justify-between mb-4">
                    <WebsiteIcon url={link.url}/>
                    <div className="flex items-center gap-2">
                        <div
                            className="text-[10px] text-gray-400 bg-[#42414D] px-1.5 py-0.5 rounded-md opacity-100 group-hover:opacity-0 translate-y-0 group-hover:-translate-y-1 transition-all duration-200">
                            {new URL(link.url).hostname.replace('www.', '')}
                        </div>
                    </div>
                </div>
                <h4 className={`text-[16px] text-white mb-0.5 line-clamp-2 transition-colors`}>
                    {link.title}
                </h4>
                <p className="text-gray-400 text-[12px] line-clamp-2 overflow-hidden text-ellipsis">
                    {link.url}
                </p>
            </a>
        </div>
    );
};