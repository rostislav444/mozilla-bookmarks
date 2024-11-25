import React, {useEffect, useState, useRef} from "react";
import {ChevronDown, Search, ImageIcon} from "lucide-react";
import {useTheme} from "@/App/context/ThemeContext.jsx";

export const SearchBar = () => {
    const {colors, classes} = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const formRef = useRef(null);

    const [selectedEngine, setSelectedEngine] = useState(() => {
        const saved = localStorage.getItem('selectedSearchEngine');
        return saved ? JSON.parse(saved) : {
            name: 'DuckDuckGo',
            url: 'https://duckduckgo.com/?q=',
            imageUrl: 'https://duckduckgo.com/?ia=images&q=',
            icon: 'https://duckduckgo.com/favicon.ico'
        };
    });

    const searchEngines = [{
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        imageUrl: 'https://duckduckgo.com/?ia=images&q=',
        icon: 'https://duckduckgo.com/favicon.ico'
    }, {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        imageUrl: 'https://www.google.com/search?tbm=isch&q=',
        icon: 'https://www.google.com/favicon.ico'
    }, {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        imageUrl: 'https://www.bing.com/images/search?q=',
        icon: 'https://www.bing.com/favicon.ico'
    }];

    useEffect(() => {
        localStorage.setItem('selectedSearchEngine', JSON.stringify(selectedEngine));
    }, [selectedEngine]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }

            searchTimeout.current = setTimeout(() => {
                browser.runtime.sendMessage({
                    type: 'GET_SEARCH_SUGGESTIONS',
                    query: searchQuery
                }).then(suggestions => {
                    if (Array.isArray(suggestions)) {
                        setSuggestions(suggestions);
                        setShowSuggestions(true);
                    }
                }).catch(error => {
                    console.error('Error fetching suggestions:', error);
                    setSuggestions([]);
                    setShowSuggestions(false);
                });
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery]);

    const handleSearch = (e, isImageSearch = false) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const searchUrl = isImageSearch ? selectedEngine.imageUrl : selectedEngine.url;
            window.open(searchUrl + encodeURIComponent(searchQuery), '_blank');
        }
    };

    const handleEngineSelect = (engine) => {
        setSelectedEngine(engine);
        setIsDropdownOpen(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        window.open(selectedEngine.url + encodeURIComponent(suggestion), '_blank');
    };

    return <>
        <form ref={formRef} onSubmit={handleSearch} className="z-50 flex-1 max-w-4xl relative">
            <div className="relative w-full grid grid-cols-5 gap-2">
                <div className="relative w-full">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-12 w-full flex items-center gap-2 px-3 bg-color2 hover:bg-[#52525E] rounded-md mr-3
                            text-gray-300 whitespace-nowrap transition-colors"
                    >
                        <img
                            src={selectedEngine.icon}
                            alt={selectedEngine.name}
                            className="w-4 h-4"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <span className="text-sm text-text1">{selectedEngine.name}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400"/>
                    </button>

                    {isDropdownOpen && (
                        <div
                            className="absolute top-full left-0 mt-1 w-full bg-color2 rounded-lg border border-gray-700/50 py-1 z-50">
                            {searchEngines.map((engine) => (
                                <button
                                    key={engine.name}
                                    type="button"
                                    onClick={() => handleEngineSelect(engine)}
                                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#52525E] text-text1 text-sm transition-colors"
                                >
                                    <img
                                        src={engine.icon}
                                        alt={engine.name}
                                        className="w-4 h-4"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    {engine.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className='flex items-center col-span-4'>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск в интернете..."
                        className="flex-1 h-12 px-3 bg-color2 text-text1 placeholder-text1 focus:outline-none rounded-l-md border-none"
                    />
                    <button
                        type="button"
                        onClick={(e) => handleSearch(e, true)}
                        className="h-12 px-3 bg-color2 hover:bg-[#52525E] text-gray-400 transition-colors border-l border-gray-700/50"
                    >
                        <ImageIcon className="w-4 h-4 text-text1"/>
                    </button>
                    <button
                        type="submit"
                        className="h-12 px-3 bg-color2 hover:bg-[#52525E] rounded-r-lg text-gray-400 transition-colors"
                    >
                        <Search className="w-4 h-4 text-text1"/>
                    </button>
                </div>
            </div>

            {/* Подсказки поиска */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    className="z-50 absolute w-full right-0 top-full mt-2 bg-color2 rounded-lg border border-color1 overflow-hidden z-50">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-color1 text-text1 text-sm transition-colors"
                        >
                            <Search className="w-4 h-4 text-text1 flex-shrink-0"/>
                            <span className="truncate text-left">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}
        </form>
        {showSuggestions && <div className="z-40 fixed w-full h-full top-0 left-0 bg-color1  opacity-75"></div>}
    </>
};