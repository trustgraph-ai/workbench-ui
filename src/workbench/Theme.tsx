
import React from 'react';

import { createTheme } from '@mui/material';

export const tgTheme = createTheme({
  palette: {
    primary: {
      light: '#395da5',
      main: '#5285ed',
      dark: '#749df0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#9c9c9c',
      main: '#e0e0e0',
      dark: '#e6e6e6',
      contrastText: '#000',
    },
  },
});
