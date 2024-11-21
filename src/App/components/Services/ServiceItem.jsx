import React, {useState} from 'react';
import * as LucideIcons from 'lucide-react';
import { Edit, Trash, GripHorizontal } from 'lucide-react';

export const ServiceItem = ({service, onEdit, onDelete, isDragging, isEditMode}) => {
    const [isHovered, setIsHovered] = useState(false);

    const renderIcon = () => {
        if (service.icon) {
            return (
                <img
                    src={service.icon}
                    alt={service.name}
                    className="w-6 h-6"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        if (service.lucideIcon && LucideIcons[service.lucideIcon]) {
                            const Icon = LucideIcons[service.lucideIcon];
                            e.target.parentNode.insertBefore(
                                React.createElement(Icon, {
                                    size: 16,
                                    className: 'text-gray-300'
                                }),
                                e.target
                            );
                        } else {
                            const Icon = LucideIcons.Link;
                            e.target.parentNode.insertBefore(
                                React.createElement(Icon, {
                                    size: 16,
                                    className: 'text-gray-300'
                                }),
                                e.target
                            );
                        }
                    }}
                />
            );
        } else if (service.lucideIcon && LucideIcons[service.lucideIcon]) {
            const Icon = LucideIcons[service.lucideIcon];
            return <Icon size={16} className="text-gray-300" />;
        }

        return <LucideIcons.Link size={16} className="text-gray-300" />;
    };

    return (
        <div
            className={`relative group bg-[#2B2A33] p-3 rounded-lg hover:bg-[#52525E] transition-all duration-200 ${
                isDragging ? 'cursor-grabbing' : isEditMode ? 'cursor-grab' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditMode && (
                <>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(service);
                            }}
                            className="p-1 bg-[#42414D] rounded-md hover:bg-[#52525E]"
                        >
                            <Edit className="w-3 h-3 text-gray-300"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm('Удалить этот сервис?')) {
                                    onDelete(service.id);
                                }
                            }}
                            className="p-1 bg-red-500/20 rounded-md hover:bg-red-500/30"
                        >
                            <Trash className="w-3 h-3 text-red-400"/>
                        </button>
                    </div>

                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripHorizontal className="w-3 h-3 text-gray-400"/>
                    </div>
                </>
            )}

            <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
                onClick={(e) => {
                    if (isHovered && isEditMode) {
                        e.preventDefault();
                    }
                }}
            >
                <div className="w-8 h-8 rounded-sm flex items-center justify-center mb-1.5">
                    {renderIcon()}
                </div>
                <span className="text-xs text-gray-300 text-center">
                    {service.name}
                </span>
            </a>
        </div>
    );
};