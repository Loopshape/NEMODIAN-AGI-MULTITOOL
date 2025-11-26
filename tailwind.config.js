/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        monokai: {
          bg: "#272822",
          fg: "#f8f8f2",
          green: "#a6e22e",
          orange: "#fd971f",
          pink: "#f92672",
          blue: "#66d9ef",
          purple: "#ae81ff",
          red: "#f92672",
          yellow: "#e6db74"
        }
      }
    }
  },
  plugins: []
};

