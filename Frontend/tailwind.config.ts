import type { Config } from "tailwindcss";

const config: Config = {
  // Fix: Remove the brackets [] around "class"
  darkMode: "class", 
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ... rest of your config
};
export default config;