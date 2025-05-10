import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#B892FF", // Lavender / Soft Purple
          foreground: "#F8F8F8", // Off-white for text on primary
          light: "#D6C0FF", // Lighter variant
          dark: "#9A75E0", // Darker variant
        },
        secondary: {
          DEFAULT: "#9EEAF9", // Soft Sky Blue
          foreground: "#2D2D2D", // Charcoal for text on secondary
          light: "#C3F2FF", // Lighter variant
          dark: "#76D1F0", // Darker variant
        },
        accent: {
          DEFAULT: "#FF6D6D", // Neon Coral / Pink
          foreground: "#F8F8F8", // Off-white for text on accent
          light: "#FF9797", // Lighter variant
          dark: "#E94F4F", // Darker variant
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E9E9E9", // Light gray
          foreground: "#757575", // Medium gray for text
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        mint: {
          light: "#E0F5EB",
          DEFAULT: "#8BD8B4",
          dark: "#4ABB8B",
        },
        peach: {
          light: "#FFEEE3",
          DEFAULT: "#FFCFB3",
          dark: "#FFA072",
        },
        lavender: {
          light: "#F0EEFF",
          DEFAULT: "#D3D0FF",
          dark: "#B1ACFF",
        },
        app: {
          background: "#FDF5EF", // Updated to the new color
          card: "#FFFFFF",
          text: "#2D2D2D", // Charcoal
          subtext: "#757575",
          border: "#E9E9E9",
        },
        olivia: {
          message: "#3D2748", // Added Olivia's message color
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bubble-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bubble-in": "bubble-in 0.3s ease-out forwards",
        pulse: "pulse 1.5s infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
