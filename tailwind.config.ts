import { Epilogue } from 'next/font/google';
import type { Config } from 'tailwindcss';

const config: Config = {

    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
            }
        },
    },

    plugins: [],
}

export default config