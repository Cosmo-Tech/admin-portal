import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
      light: '#F6F3FF',
    },
    secondary: {
      main: '#FFCC89',
      light: '#FFEDD5',
    },
    tertiary: {
      main: '#4CAF50',
    },
    error: {
      main: '#FF4444',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F6F3FF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
