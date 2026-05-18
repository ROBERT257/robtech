/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';


// Rotech custom theme colors
const tintColorLight = '#00D09E'; // Accent Green
const tintColorDark = '#00D09E';
const backgroundDark = '#0B0F19';
const cardDark = '#151B2D';
const accentGreen = '#00D09E';

export const Colors = {
  light: {
    text: '#ECEDEE',
    textSecondary: '#687076',
    background: '#fff',
    tint: tintColorLight,
    icon: '#00D09E',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#F5F6FA',
    accent: accentGreen,
    border: '#E0E0E0',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: backgroundDark,
    tint: tintColorDark,
    icon: accentGreen,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: cardDark,
    accent: accentGreen,
    border: '#2A3447',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
