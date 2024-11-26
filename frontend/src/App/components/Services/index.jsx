import React, {useEffect, useRef, useState} from 'react';
import {Plus, SquareMenu} from 'lucide-react';
import {ReactSortable} from "react-sortablejs";
import {ServiceItem} from "@components/Services/ServiceItem.jsx";
import {ServiceModal} from "@components/Services/ServiceModal.jsx";
import {useTheme} from "@/App/context/ThemeContext.jsx";

const Switch = ({checked, onChange}) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? 'bg-accent' : 'bg-color3'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                checked ? 'translate-x-5' : 'translate-x-1'
            }`}
        />
    </button>
);

export const ServicesMenu = () => {
    const {colors, classes} = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [services, setServices] = useState(() => {
        const saved = localStorage.getItem('services');
        return saved ? JSON.parse(saved) : [
            {
                id: '1',
                name: 'Gmail',
                icon: 'https://www.google.com/favicon.ico',
                url: 'https://mail.google.com'
            },
            {
                id: '2',
                name: 'Calendar',
                icon: 'https://calendar.google.com/favicon.ico',
                url: 'https://calendar.google.com'
            },
            {
                id: '3',
                name: 'Drive',
                icon: 'https://drive.google.com/favicon.ico',
                url: 'https://drive.google.com'
            }
        ];
    });

    const menuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('services', JSON.stringify(services));
    }, [services]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveService = (service) => {
        if (editingService) {
            setServices(services.map(s => s.id === service.id ? service : s));
        } else {
            setServices([...services, service]);
        }
        setEditingService(null);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDeleteService = (id) => {
        setServices(services.filter(service => service.id !== id));
    };

    return (
        <div className="relative flex align-middle" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1 hover:bg-color3 rounded-md transition-colors`}
            >
                <div className='w-4 h-4 grid grid-cols-3 grid-rows-3 gap-0.5'>
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{backgroundColor: 'var(--text1)'}}
                        />
                    ))}
                </div>
            </button>
            {isMenuOpen && (
                <div
                    className={`absolute top-full right-0 mt-2 w-[320px] bg-color2 rounded-lg ${classes.border} overflow-hidden z-[60]
                       shadow-lg transition-transform duration-300 shadow-color1
                    `}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className={`text-base font-semibold ${classes.text}`}>Сервисы</h3>
                            <Switch checked={isEditMode} onChange={setIsEditMode}/>
                        </div>

                        <ReactSortable
                            list={services}
                            setList={setServices}
                            className="grid grid-cols-3 gap-2"
                            animation={200}
                            delay={2}
                            delayOnTouchOnly={true}
                            onStart={() => setIsDragging(true)}
                            onEnd={() => setIsDragging(false)}
                            disabled={!isEditMode}
                        >
                            {services.map((service) => (
                                <ServiceItem
                                    key={service.id}
                                    service={service}
                                    onEdit={handleEditService}
                                    onDelete={handleDeleteService}
                                    isDragging={isDragging}
                                    isEditMode={isEditMode}
                                />
                            ))}
                        </ReactSortable>

                        {isEditMode && (
                            <button
                                onClick={() => {
                                    setEditingService(null);
                                    setIsModalOpen(true);
                                }}
                                className={`flex flex-col items-center justify-center p-2 hover:bg-color3 rounded-lg transition-colors w-full mt-2`}
                            >
                                <div className={`w-7 h-7 bg-color3 rounded-md flex items-center justify-center mb-1.5`}>
                                    <Plus className={`w-4 h-4 ${classes.textSecondary}`}/>
                                </div>
                                <span className={`text-xs ${classes.text}`}>Добавить</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                }}
                onSave={handleSaveService}
                editingService={editingService}
            />
        </div>
    );
};