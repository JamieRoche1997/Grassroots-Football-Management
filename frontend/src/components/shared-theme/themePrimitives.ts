import { createTheme, alpha, PaletteMode, Shadows } from '@mui/material/styles';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}
declare module '@mui/material/styles/createPalette' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface Palette {
    baseShadow: string;
  }
}

const defaultTheme = createTheme();

const customShadows: Shadows = [...defaultTheme.shadows];

// ========== Updated Color Palettes ========== //
export const brand = {
  50: '#E8F9F0',
  100: '#C6F0D9',
  200: '#A0E6C0',
  300: '#6BD99D',
  400: '#2BD575', // Primary green (vibrant turf)
  500: '#1E8A4A', // Dark green
  600: '#1A7A42',
  700: '#156635',
  800: '#105229',
  900: '#0A361B',
};

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

export const gray = {
  50: '#F8F9FA', // Light mode background
  100: '#F1F3F5',
  200: '#E2E8F0', // Dark mode text primary
  300: '#CBD5E0',
  400: '#A0AEC0', // Dark mode text secondary
  500: '#718096',
  600: '#4A5568',
  700: '#2D3748', // Light mode text primary
  800: '#1E1E1E', // Dark mode surface
  900: '#121212', // Dark mode background
};

export const blue = {
  50: '#EBF5FF',
  100: '#D6EAFF',
  200: '#9FD1FF',
  300: '#3AB0FF', // Sky blue accent
  400: '#1E90FF',
  500: '#0074D9',
  600: '#005FA6',
  700: '#004A80',
  800: '#003359',
  900: '#001D33',
};

export const gold = {
  50: '#FFF9E6',
  100: '#FFEFB3',
  200: '#FFE680',
  300: '#FFDD4D',
  400: '#FFD700', // Trophy gold
  500: '#FFC600',
  600: '#FFB300',
  700: '#FFA000',
  800: '#FF8D00',
  900: '#FF6D00',
};

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

export const red = {
  50: '#FFEBEE',
  100: '#FFCDD2',
  200: '#EF9A9A',
  300: '#E57373',
  400: '#FF5C5C', // Football red
  500: '#F44336',
  600: '#E53935',
  700: '#D32F2F',
  800: '#C62828',
  900: '#B71C1C',
};

// ========== Theme Generator ========== //
export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === 'dark'
      ? '0px 4px 16px rgba(0, 0, 0, 0.7), 0px 8px 16px rgba(0, 0, 0, 0.8)'
      : '0px 4px 16px rgba(0, 0, 0, 0.07), 0px 8px 16px rgba(0, 0, 0, 0.07)';

  return {
    palette: {
      mode,
      primary: {
        light: brand[300],
        main: brand[400], // #2BD575
        dark: brand[500], // #1E8A4A
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: gray[50],
          light: brand[300],
          main: brand[400],
          dark: brand[500],
        }),
      },
      secondary: {
        light: blue[200],
        main: blue[300], // #3AB0FF
        dark: blue[600],
        contrastText: gray[900],
        ...(mode === 'dark' && {
          contrastText: gray[50],
        }),
      },
      warning: {
        light: gold[200],
        main: gold[400], // #FFD700
        dark: gold[600],
      },
      error: {
        light: red[300],
        main: red[400], // #FF5C5C
        dark: red[700],
      },
      success: {
        light: brand[200],
        main: brand[400],
        dark: brand[600],
      },
      grey: {
        ...gray,
      },
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: mode === 'dark' ? gray[900] : gray[50], // #121212 or #F8F9FA
        paper: mode === 'dark' ? gray[800] : '#FFFFFF', // #1E1E1E or white
      },
      text: {
        primary: mode === 'dark' ? gray[200] : gray[700], // #E2E8F0 or #2D3748
        secondary: mode === 'dark' ? gray[400] : gray[600], // #A0AEC0 or #718096
      },
      action: {
        hover: mode === 'dark' ? alpha(gray[600], 0.2) : alpha(gray[200], 0.2),
        selected: mode === 'dark' ? alpha(gray[600], 0.3) : alpha(gray[200], 0.3),
      },
    },
    typography: {
      fontFamily: `'Poppins', 'Inter', 'Segoe UI', sans-serif`,
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        lineHeight: 1.2,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(18),
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 400,
      },
      caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        light: brand[300],
        main: brand[400],
        dark: brand[500],
        contrastText: gray[50],
      },
      secondary: {
        light: blue[200],
        main: blue[300],
        dark: blue[600],
        contrastText: gray[900],
      },
      warning: {
        light: gold[200],
        main: gold[400],
        dark: gold[600],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[700],
      },
      background: {
        default: gray[50],
        paper: '#FFFFFF',
      },
      text: {
        primary: gray[700],
        secondary: gray[600],
      },
    },
  },
  dark: {
    palette: {
      primary: {
        light: brand[300],
        main: brand[400],
        dark: brand[500],
        contrastText: gray[50],
      },
      secondary: {
        light: blue[200],
        main: blue[300],
        dark: blue[600],
        contrastText: gray[50],
      },
      warning: {
        light: gold[200],
        main: gold[400],
        dark: gold[600],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[700],
      },
      background: {
        default: gray[900],
        paper: gray[800],
      },
      text: {
        primary: gray[200],
        secondary: gray[400],
      },
    },
  },
};

export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
};

export const shape = {
  borderRadius: 8,
};

// @ts-expect-error Unreachable code error
const defaultShadows: Shadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;
