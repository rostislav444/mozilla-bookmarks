import React from 'react';
import {Star} from 'lucide-react';

export const BookmarkForm = ({title, onTitleChange, onSave, disabled}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400"/>
                <h2 className="text-lg font-semibold">Добавить закладку</h2>
            </div>

            <div>
                <label className="block text-sm mb-1">Название</label>
                <input
                    type="text"
                    value={title}
                    onChange={onTitleChange}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
            </div>

            <button
                onClick={onSave}
                disabled={disabled}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
            >
                Сохранить
            </button>
        </div>
    );
};