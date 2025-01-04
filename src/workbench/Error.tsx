
import React from 'react';

import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

import { useProgressStateStore } from './state/ProgressState';

const Error : React.FC<{}> = () => {

    const error = useProgressStateStore((state) => state.error);
    const setError = useProgressStateStore((state) => state.setError);

    const handleClose = (
        _event : React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setError("");
    };

    const action = (
        <>
            <Button color="error" size="small" onClick={() => setError("")}>
                Close
            </Button>
        </>
    );

    return (
        <>

            <Snackbar
                open={error != ""}
                autoHideDuration={6000}
                onClose={handleClose}
                message={error}
                action={action}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />

        </>

    );

};

export default Error;

