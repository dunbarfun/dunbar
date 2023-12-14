/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      zIndex: {
        '200': '200'
      },
      colors: {
        primary: '#EC5E2C',
        "text-primary": "#FFFFFF",
        "text-secondary": "#838383",

        "background-primary": "#171719",
        "background-secondary": '#2E2E2E',

        "button-primary": "#575757",
      },
      fontFamily: {
        bricolage: "var(--font-bricolage)"
      },
    },
  },
} satisfies Config;

