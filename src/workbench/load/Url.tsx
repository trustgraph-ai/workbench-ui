
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button, TextField } from '@mui/material';

interface UrlProps {
    value : string,
    setValue : (value : string) => void;
}

const Url : React.FC<UrlProps> = ({
    value, setValue,
}) => {

    return (
        <>

            <Box>

                <TextField
                    sx={{
                        width: '50rem',
                        m: 1,
                    }}
                    label="Published at URL"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Url;

