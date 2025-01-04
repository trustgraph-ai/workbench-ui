
import { createTheme } from '@mui/material/styles';
import darkScrollbar from '@mui/material/darkScrollbar';

export const tgTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#61a4fe',
            main: '#5285ed',
            dark: '#4962c6',
            contrastText: '#fff',
        },
        secondary: {
            main: '#edb952',
        },
        info: {
            main: '#149d9c',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: (themeParam) => ({
                body: themeParam.palette.mode === 'dark' ?
                    darkScrollbar() :
                    null,
            }),
        },
    },
});

