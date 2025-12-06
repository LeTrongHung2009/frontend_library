/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Màu Zinc chuẩn phong cách Commit
        dark: {
          900: '#09090b', // Sidebar bg
          800: '#18181b', // Card bg / Hover
          700: '#27272a', // Border
        },
        light: {
          50: '#fafafa',  // Main bg
          100: '#f4f4f5', // Table header
        }
      }
    },
  },
  plugins: [],
}