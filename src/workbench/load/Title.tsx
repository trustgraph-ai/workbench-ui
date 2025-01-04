
import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

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
                    helperText="document title (optional)"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Title;

