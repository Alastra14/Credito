export const lightColors = {
  primary: {
    default: '#CCFF00', // Radioactive green
    light: '#E6FF80',
    dark: '#99CC00',
    text: '#000000',
  },
  surface: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    muted: '#E0E0E0',
    border: '#E5E5E5',
    inverse: '#121212', // For black cards
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    muted: '#999999',
    disabled: '#CCCCCC',
    inverse: '#FFFFFF',
  },
  success: {
    default: '#CCFF00',
    light: '#E6FF80',
    text: '#000000',
  },
  warning: {
    default: '#FF00FF', // Neon pink
    light: '#FF66FF',
    text: '#FFFFFF',
  },
  destructive: {
    default: '#FF3333',
    light: '#FF9999',
    text: '#FFFFFF',
  },
  info: {
    default: '#00FFFF', // Cyan
    light: '#99FFFF',
    text: '#000000',
  },
};

export const darkColors = {
  primary: {
    default: '#CCFF00',
    light: '#E6FF80',
    dark: '#99CC00',
    text: '#000000',
  },
  surface: {
    background: '#121212',
    card: '#1E1E1E',
    muted: '#2C2C2C',
    border: '#333333',
    inverse: '#2A2A2A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#666666',
    disabled: '#444444',
    inverse: '#CCFF00',
  },
  success: {
    default: '#CCFF00',
    light: '#E6FF80',
    text: '#000000',
  },
  warning: {
    default: '#FF00FF',
    light: '#FF66FF',
    text: '#FFFFFF',
  },
  destructive: {
    default: '#FF4444',
    light: '#FF9999',
    text: '#FFFFFF',
  },
  info: {
    default: '#00FFFF',
    light: '#99FFFF',
    text: '#000000',
  },
};

// For backward compatibility during refactor
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const typography = {
  titleUrban: {
    fontFamily: 'sans-serif-condensed',
    textTransform: 'uppercase' as const,
    letterSpacing: -0.5,
    fontWeight: '900' as const,
  },
  numbers: {
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  numbersMedium: {
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  numbersRegular: {
    fontFamily: 'SpaceGrotesk_400Regular',
  },
};
