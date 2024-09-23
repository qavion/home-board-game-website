import createTheme from '@mui/material/styles/createTheme';

declare module '@mui/material/styles' {
  interface Theme {
    icons: Record<string, string>;
  }
  interface ThemeOptions {
    icons?: Record<string, string>;
  }
}

const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

// 共通のパレット設定
const commonPalette = {
  primary: {
    main: '#2196F3',
  },
  secondary: {
    main: '#f50057',
  },
};

const darkTheme = createTheme({
  palette: {
    ...commonPalette,
    mode: 'dark',
    background: {
      default: '#232323',
      paper: '#303030',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
  },
  icons: {
    logo: `${cloudfrontDomain}/images/favicon_512x512_white.png`,
  },
});

const lightTheme = createTheme({
  palette: {
    ...commonPalette,
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  icons: {
    logo: `${cloudfrontDomain}/images/favicon_512x512.png`,
  },
});

export { darkTheme, lightTheme };
