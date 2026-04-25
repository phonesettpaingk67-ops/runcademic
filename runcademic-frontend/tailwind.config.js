/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary & Accent Colors
        "slate-blue": {
          50: "#f0f2f7",
          100: "#e1e5f0",
          200: "#c3cbe1",
          300: "#a5b1d2",
          400: "#8797c4",
          500: "#3B4A6B",
          600: "#2d3851",
          700: "#1f2638",
          800: "#151a20",
          900: "#0d0f17",
        },
        "sky-blue": {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#c1defd",
          300: "#a2cefc",
          400: "#83befb",
          500: "#5B9FD4",
          600: "#4680aa",
          700: "#316080",
          800: "#1c4056",
          900: "#07202c",
        },
        "mint": {
          50: "#f0fdf5",
          100: "#e1fceb",
          200: "#c3f9d7",
          300: "#a5f6c3",
          400: "#87f3af",
          500: "#2ECC71",
          600: "#26a35a",
          700: "#1e7a43",
          800: "#16512c",
          900: "#0e2815",
        },
        "coral": {
          50: "#fef2f1",
          100: "#fde5e3",
          200: "#fbcbc7",
          300: "#f9b1ab",
          400: "#f7978f",
          500: "#E74C3C",
          600: "#ba3d30",
          700: "#8d2e24",
          800: "#601f18",
          900: "#33100c",
        },
        "amber": {
          50: "#fffbf0",
          100: "#fff7e1",
          200: "#ffefc3",
          300: "#ffe7a5",
          400: "#ffdf87",
          500: "#F39C12",
          600: "#c27d0e",
          700: "#915e0a",
          800: "#603f07",
          900: "#302003",
        },
        "purple": {
          50: "#f9f7fd",
          100: "#f3effb",
          200: "#e7dff7",
          300: "#dbcff3",
          400: "#cfbfef",
          500: "#8E44AD",
          600: "#71368a",
          700: "#542867",
          800: "#371a44",
          900: "#1a0c21",
        },
        // Neutral Colors
        "neutral": {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#212121",
            a: {
              color: "#5B9FD4",
              "&:hover": {
                color: "#3B4A6B",
              },
            },
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Typography Scale
        "heading-1": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-2": ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        "heading-3": ["24px", { lineHeight: "1.33", fontWeight: "700" }],
        "body": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.43", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.33", fontWeight: "500" }],
      },
      spacing: {
        // 8px base unit spacing
        0.5: "0.25rem",   // 4px
        1: "0.5rem",      // 8px
        2: "1rem",        // 16px
        3: "1.5rem",      // 24px
        4: "2rem",        // 32px
        5: "2.5rem",      // 40px
        6: "3rem",        // 48px
        7: "3.5rem",      // 56px
        8: "4rem",        // 64px
      },
      boxShadow: {
        // Elevation Levels
        "elevation-1": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "elevation-2": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "elevation-3": "0 8px 24px rgba(0, 0, 0, 0.16)",
        "elevation-4": "0 12px 32px rgba(0, 0, 0, 0.20)",
        "focus": "0 0 0 3px rgba(91, 159, 212, 0.5)",
      },
      transitionDuration: {
        "fast": "150ms",
        "base": "200ms",
        "slow": "300ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}
