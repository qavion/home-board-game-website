import { createTheme, Theme } from '@mui/material/styles';

interface CustomTheme extends Theme {
  icons: Record<string, string>;
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

// ダークテーマとライトテーマのパレット設定
const darkPalette = {
  mode: 'dark',
  background: {
    default: '#232323',
    paper: '#303030',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0',
  },
};

const lightPalette = {
  mode: 'light',
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
};

// ダークテーマとライトテーマのアイコン設定
const darkIcons: CustomTheme['icons'] = {
  logo: `${cloudfrontDomain}/images/favicon_512x512_white.png`,
};

const lightIcons: CustomTheme['icons'] = {
  logo: `${cloudfrontDomain}/images/favicon_512x512.png`,
};

// 最終的なテーマ
const baseTheme = createTheme({
  palette: commonPalette,
});

const darkTheme = createTheme(baseTheme, {
  palette: darkPalette,
}) as CustomTheme;
darkTheme.icons = darkIcons;

const lightTheme = createTheme(baseTheme, {
  palette: lightPalette,
}) as CustomTheme;
lightTheme.icons = lightIcons;

export { darkTheme, lightTheme, type CustomTheme };