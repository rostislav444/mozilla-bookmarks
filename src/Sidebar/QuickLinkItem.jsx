import React from 'react';
import {Link} from 'lucide-react';

export const QuickLinkItem = ({link}) => {
    const domain = new URL(link.url).hostname.replace('www.', '');

    const handleClick = (e) => {
        e.preventDefault();
        window.parent.location.href = link.url;
    };

    return (
        <a
            href={link.url}
            onClick={handleClick}
            className="block bg-[#2B2A33] p-2 rounded-sm hover:bg-gray-700 transition-colors"
        >
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-blue-500/10 rounded-md">
                    <Link className="w-3 h-3 text-blue-400"/>
                </div>
                <span className="text-[10px] text-gray-400">{domain}</span>
            </div>
            <h4 className="text-xs text-white truncate">{link.title}</h4>
        </a>
    );
};