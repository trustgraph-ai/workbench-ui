
import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Send from '@mui/icons-material/Send';

interface ProgressSubmitButtonProps {
    disabled : boolean;
    working : boolean;
};

const ProgressSubmitButton : React.FC <ProgressSubmitButtonProps> = ({
    disabled, working,
}) => {

    return (

        <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <Box sx={{ m: 1, position: 'relative' }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={disabled}
                    endIcon={<Send/>}
                    sx={{ ml: 1 }}
                >
                    Send
                </Button>
            </Box>

            <Box sx={{ m: 1, position: 'relative' }}>
                {
                    (working) &&
                    <CircularProgress
                        size={24}
                        sx={{
                            color: 'gray',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-75px',
                        }}
                    />
                }
            </Box>

        </Box>

    );

}

export default ProgressSubmitButton;

