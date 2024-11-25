// context/ThemeContext.jsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import {shadeColor} from "@/App/utils/colorShade.js";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};


export const ThemeProvider = ({children}) => {
    const [themeColors, setThemeColors] = useState({
        // Основные цвета из скриншота Firefox Dark theme
        color1: '#1C1B22', // Самый темный - фон страницы
        color1Light: '#2F2E36', // На 35% светлее
        color1Dark: '#0F0E13', // На 35% темнее
        color2: '#2B2A33', // Фон папок и элементов
        color3: '#42414D', // Фон при наведении
        color4: '#5B5B66', // Более светлый для бордеров и разделителей
        text1: '#FBFBFE', // Основной текст
        text2: '#C0C0C6', // Вторичный текст
        accent: '#0060DF', // Акцентный цвет (синий)

        // Состояния
        hover: 'rgba(255, 255, 255, 0.1)', // Осветление при наведении
        active: 'rgba(255, 255, 255, 0.15)', // Осветление при нажатии
        selected: 'rgba(0, 96, 223, 0.3)', // Выделение (синий полупрозрачный)

        // Дополнительные цвета
        error: '#FF3B6B',
        success: '#86DE74',
        warning: '#FFD567',
        overlay: 'rgba(28, 27, 34, 0.8)' // Для модальных окон
    });

    useEffect(() => {
        const getThemeColors = async () => {
            try {
                const browserAPI = window.browser || window.chrome;

                if (browserAPI?.theme?.getCurrent) {
                    const theme = await browserAPI.theme.getCurrent();
                    const colors = theme.colors || theme;
                    const baseColor1 = colors.frame || '#1C1B22';

                    setThemeColors(prev => ({
                        color1: baseColor1,
                        color1Light: colors.toolbar_text,
                        color1Light2: shadeColor(baseColor1, 30),
                        color1Dark: shadeColor(baseColor1, -35),
                        color2: colors.toolbar || prev.color2,
                        color3: colors.toolbar_field || prev.color3,
                        color4: colors.toolbar_vertical_separator || prev.color4,
                        text1: colors.toolbar_text || prev.text1,
                        text2: colors.toolbar_field_text || prev.text2,
                        accent: colors.button_background_active || prev.accent,
                        // Остальные цвета оставляем как есть
                    }));

                    // Устанавливаем CSS переменные
                    const root = document.documentElement;
                    root.style.setProperty('--color1', baseColor1);
                    root.style.setProperty('--color1-light', colors.toolbar_text);
                    root.style.setProperty('--color1-light-2', shadeColor(baseColor1, 30));
                    root.style.setProperty('--color1-dark', shadeColor(baseColor1, -35));
                    root.style.setProperty('--color2', colors.toolbar || '#2B2A33');
                    root.style.setProperty('--color3', colors.toolbar_field || '#42414D');
                    root.style.setProperty('--color4', colors.toolbar_vertical_separator || '#5B5B66');
                    root.style.setProperty('--text1', colors.toolbar_text || '#FBFBFE');
                    root.style.setProperty('--text2', colors.toolbar_field_text || '#C0C0C6');
                    root.style.setProperty('--accent', colors.button_background_active || '#0060DF');
                }
            } catch (error) {
                console.error('Failed to get theme colors:', error);
            }
        };

        getThemeColors();

        const browserAPI = window.browser || window.chrome;
        if (browserAPI?.theme?.onUpdated) {
            browserAPI.theme.onUpdated.addListener(getThemeColors);
            return () => browserAPI.theme.onUpdated.removeListener(getThemeColors);
        }
    }, []);

    // Tailwind классы
    const tailwindClasses = {
        background: 'bg-color1',
        surface: 'bg-color2',
        surfaceHover: 'hover:bg-color3',
        text: 'text-text1',
        textSecondary: 'text-text2',
        border: 'border-color4',
        accentBg: 'bg-accent',
        accentText: 'text-accent',
    };

    return (
        <ThemeContext.Provider value={{colors: themeColors, classes: tailwindClasses}}>
            {children}
        </ThemeContext.Provider>
    );
};