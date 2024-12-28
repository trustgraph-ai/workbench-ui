
import React from 'react';

import { Box, TextField } from '@mui/material';

interface TitleProps {
    value : string,
    setValue : (value : string) => void;
}

const Title : React.FC<TitleProps> = ({
    value, setValue,
}) => {

    return (
        <>

            <Box sx={{ m: 2 }}>

                <TextField
                    sx={{
                        width: '50rem',
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

