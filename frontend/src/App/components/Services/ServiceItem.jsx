import React, {useState} from 'react';
import * as LucideIcons from 'lucide-react';
import {Edit, Trash, GripHorizontal} from 'lucide-react';
import {useTheme} from "@/App/context/ThemeContext.jsx";

export const ServiceItem = ({service, onEdit, onDelete, isDragging, isEditMode}) => {
    const { classes } = useTheme();
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
            return <Icon size={16} className="text-gray-300"/>;
        }

        return <LucideIcons.Link size={16} className="text-gray-300"/>;
    };


    return (
        <div
            className={`relative group ${classes.surface} p-3 rounded-lg hover:bg-color3 transition-all duration-200 ${
                isDragging ? 'cursor-grabbing' : isEditMode ? 'cursor-grab' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditMode && (
                <>
                    <div
                        className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(service);
                            }}
                            className={`p-1 bg-color3 rounded-md hover:bg-color4`}
                        >
                            <Edit className={`w-3 h-3 ${classes.text}`}/>
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
                        <GripHorizontal className={`w-3 h-3 ${classes.textSecondary}`}/>
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
                <span className={`text-xs ${classes.text} text-center`}>
                    {service.name}
                </span>
            </a>
        </div>
    );
};