import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { primary: '#1c7ed6', secondary: '#868e96' } } },
  plugins: []
};
export default config;