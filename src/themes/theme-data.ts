export interface Theme {
  colors: {
    background: string;
    card: string;
    primary: string;
    primaryDark: string;
    text: string;
    textSecondary: string;
    danger: string;
    border: string;
    surface: string;
    badgeText: string;
    badgeBg: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
}

const sharedSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const sharedBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const darkTheme: Theme = {
  colors: {
    background: '#121212',
    card: '#1E1E1E',
    primary: '#10b981', // Emerald green
    primaryDark: '#047857',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    danger: '#EF4444',
    border: '#374151',
    surface: '#27272A',
    badgeText: '#d1fae5',
    badgeBg: '#065f46',
  },
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
};

export const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    card: '#F3F4F6', // Lighter grey for cards
    primary: '#10b981', 
    primaryDark: '#047857',
    text: '#111827', // Dark gray text
    textSecondary: '#4B5563', // Medium gray secondary
    danger: '#EF4444',
    border: '#E5E7EB', // Very light gray borders
    surface: '#F9FAFB',
    badgeText: '#065f46',
    badgeBg: '#d1fae5',
  },
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
};
