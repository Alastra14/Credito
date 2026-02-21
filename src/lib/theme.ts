export const colors = {
  primary: {
    default: '#6366f1',
    light: '#e0e7ff',
    dark: '#4338ca',
    text: '#ffffff',
  },
  surface: {
    background: '#f8fafc',
    card: '#ffffff',
    muted: '#f1f5f9',
    border: '#e2e8f0',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff',
  },
  success: {
    default: '#22c55e',
    light: '#dcfce7',
    text: '#15803d',
  },
  warning: {
    default: '#f59e0b',
    light: '#fef3c7',
    text: '#92400e',
  },
  destructive: {
    default: '#ef4444',
    light: '#fee2e2',
    text: '#b91c1c',
  },
  info: {
    default: '#3b82f6',
    light: '#dbeafe',
    text: '#1d4ed8',
  },
};

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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
