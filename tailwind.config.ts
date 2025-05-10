import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".text-large": {
          fontSize: "20px",
        },
        ".text-medium": {
          fontSize: "18px",
        },
        ".text-regular": {
          fontSize: "16px",
        },
        ".text-small": {
          fontSize: "14px",
        },
        ".text-tiny": {
          fontSize: "12px",
        },

        ".desktop-h1": {
          fontSize: "107px",
        },
        ".desktop-h2": {
          fontSize: "67px",
        },
        ".desktop-h3": {
          fontSize: "54px",
        },
        ".desktop-h4": {
          fontSize: "38px",
        },
        ".desktop-h5": {
          fontSize: "27px",
        },
        ".desktop-h6": {
          fontSize: "22px",
        },
        ".desktop-tagline": {
          fontSize: "16px",
        },

        ".mobile-h1": {
          fontSize: "40px",
        },
        ".mobile-h2": {
          fontSize: "36px",
        },
        ".mobile-h3": {
          fontSize: "32px",
        },
        ".mobile-h4": {
          fontSize: "24px",
        },
        ".mobile-h5": {
          fontSize: "20px",
        },
        ".mobile-h6": {
          fontSize: "18px",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;
