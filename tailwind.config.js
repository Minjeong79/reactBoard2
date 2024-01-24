const customBorder = {
  1: '1px',
  2: '2px',
  3: '3px',
  4: '4px',
  5: '5px',
  'custom': '10px'
};

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderWidth: customBorder,
    },
  },
  plugins: [],
}