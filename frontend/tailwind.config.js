/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'color1': 'var(--color1)',
                'color1-light': 'var(--color1-light)',
                 'color1-light-2': 'var(--color1-light-2)',
                'color1-dark': 'var(--color1-dark)',
                'color2': 'var(--color2)',
                'color3': 'var(--color3)',
                'color4': 'var(--color4)',
                'text1': 'var(--text1)',
                'text2': 'var(--text2)',
                'accent': 'var(--accent)',
            },
            backgroundColor: {
                'hover': 'var(--hover)',
                'active': 'var(--active)',
                'selected': 'var(--selected)',
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}