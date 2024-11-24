import React, {useState} from 'react';
import {ChevronDown, ChevronRight as ChevronCollapse, Folder} from 'lucide-react';


// Компонент древовидной навигации
export const FolderTree = ({node, level = 0, onFolderClick}) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!node || node.url) return null;

    return (
        <div className="ml-[2px]">
            <button
                onClick={() => {
                    onFolderClick(node.id);
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-2 p-2 -ml-2 hover:bg-gray-700/30 rounded-lg group w-full transition-colors"
            >
                {node.children?.length > 0 && (
                    <div className="w-4 h-4 flex items-center justify-center">
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white"/>
                        ) : (
                            <ChevronCollapse className="w-4 h-4 text-gray-400 group-hover:text-white"/>
                        )}
                    </div>
                )}
                <Folder className="w-4 h-4 text-gray-400 group-hover:text-purple-400"/>
                <span className="text-sm text-gray-300 group-hover:text-white truncate">
                    {node.title}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                    {node.children?.length ?? 0}
                </span>
            </button>
            {isOpen && node.children && (
                <div className="ml-4 pl-4 border-l border-gray-700/50">
                    {node.children.map((child) => (
                        <FolderTree
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onFolderClick={onFolderClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};