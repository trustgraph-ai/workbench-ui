
import React from 'react';

import { Box, TextField } from '@mui/material';

interface UrlProps {
    value : string,
    setValue : (value : string) => void;
}

const Url : React.FC<UrlProps> = ({
    value, setValue,
}) => {

    return (
        <>

            <Box sx={{ m: 2 }}>

                <TextField
                    sx={{
                        width: '50rem',
                    }}
                    label="URL"
                    helperText="URL of publication (optional)"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Url;

