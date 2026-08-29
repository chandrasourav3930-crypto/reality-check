/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F6F3",
        ink: "#1E2A24",
        line: "#D9DED7",
        panel: "#FFFFFF",
        works: "#2F6F5E",
        worksSoft: "#E4F0EA",
        fails: "#B4472C",
        failsSoft: "#F6E5DF",
        mixed: "#B08A2E",
        mixedSoft: "#F3ECD9",
        accent: "#2F6F5E",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
