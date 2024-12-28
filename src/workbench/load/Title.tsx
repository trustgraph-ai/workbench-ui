
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button, TextField } from '@mui/material';

interface TitleProps {
    value : string,
    setValue : (value : string) => void;
}

const Title : React.FC<TitleProps> = ({
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
                    label="Title"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Title;

