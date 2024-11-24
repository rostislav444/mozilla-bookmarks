import React, { useState, useEffect } from 'react';

const FolderItem = ({ folder, level = 0, selectedFolder, onSelect }) => {
  // Состояние развёрнутости папки
  const [isExpanded, setIsExpanded] = useState(false);

  // Проверяем, содержит ли эта папка или её дочерние папки выбранную папку
  const hasSelectedFolder = (folder) => {
    if (folder.id === selectedFolder) return true;
    if (folder.children) {
      return folder.children.some(child => hasSelectedFolder(child));
    }
    return false;
  };

  // Автоматически разворачиваем папку, если она содержит выбранную папку
  useEffect(() => {
    if (hasSelectedFolder(folder)) {
      setIsExpanded(true);
    }
  }, [selectedFolder]);

  return (
    <div>
      <div
        className={`
          px-3 py-2 cursor-pointer hover:bg-gray-700 flex items-center gap-2
          ${selectedFolder === folder.id ? 'bg-gray-700' : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {folder.children.length > 0 && (
          <button
            className="w-4 h-4 flex items-center justify-center text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <span className="truncate">{folder.title}</span>
      </div>

      {isExpanded && folder.children.map(child => (
        <FolderItem
          key={child.id}
          folder={child}
          level={level + 1}
          selectedFolder={selectedFolder}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const FolderSelect = ({ folders, selectedFolder, onSelect }) => {
  return (
    <div className="max-h-[200px] overflow-y-auto bg-gray-800 rounded-lg border border-gray-700">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          selectedFolder={selectedFolder}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};