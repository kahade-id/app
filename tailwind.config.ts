import type { Config } from 'tailwindcss'
import sharedPreset from './shared/tailwind.preset'

const config: Config = {
  presets: [sharedPreset as Config],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // L-11 FIX: Removed './src/**/*.{js,ts,jsx,tsx}' — there is no src/ directory
    // in this project. The dead glob wasted Tailwind scan time without matching anything.
    './shared/components/**/*.{js,ts,jsx,tsx}',
  ],
}

export default config
