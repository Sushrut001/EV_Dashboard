/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        bg: "#F5F5F7",
        "bg-dark": "#000000",
        card: "#FFFFFF",
        "card-dark": "#1C1C1E",
        primary: "#007AFF",
        success: "#34C759",
        warning: "#FF9500",
        danger: "#FF3B30",
        ink: "#1D1D1F",
        "ink-dark": "#F5F5F7",
        muted: "#6E6E73",
        "muted-dark": "#98989D",
        border: "#E5E5EA",
        "border-dark": "#38383A",
      },
      borderRadius: {
        xl2: "16px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.06)",
        "soft-lg": "0 8px 30px rgba(0,0,0,0.08)",
        "soft-dark": "0 2px 12px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
}
