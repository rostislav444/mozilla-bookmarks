import React, {useEffect, useRef, useState} from 'react';
import {Plus, SquareMenu} from 'lucide-react';
import {ReactSortable} from "react-sortablejs";
import {ServiceItem} from "@components/Services/ServiceItem.jsx";
import {ServiceModal} from "@components/Services/ServiceModal.jsx";

const Switch = ({checked, onChange}) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? 'bg-blue-500' : 'bg-gray-700'
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
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-[#52525E] rounded-md transition-colors"
            >
                <div className='w-4 h-4 grid grid-cols-3 grid-rows-3 gap-0.5'>
                    {[...Array(9)].map((_, i) => (
                        <div className='w-1 h-1 rounded-full bg-gray-300'/>
                    ))}
                </div>
            </button>
            {isMenuOpen && (
                <div
                    className="absolute top-full right-0 mt-2 w-[320px] bg-[#1C1B22] rounded-lg border border-gray-700/50 overflow-hidden z-[60]">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-base font-semibold text-white">Сервисы</h3>
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
                                className="flex flex-col items-center justify-center p-2 hover:bg-[#52525E] rounded-lg transition-colors w-full mt-2"
                            >
                                <div
                                    className="w-7 h-7 bg-[#42414D] rounded-md flex items-center justify-center mb-1.5">
                                    <Plus className="w-4 h-4 text-gray-400"/>
                                </div>
                                <span className="text-xs text-gray-300">Добавить</span>
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
}