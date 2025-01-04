
import React from 'react';

import { Box } from '@mui/material';
import { Autocomplete, Chip, TextField } from "@mui/material"

interface KeywordsProps {
    value : string[],
    setValue : (value : string[]) => void;
}

const Keywords : React.FC<KeywordsProps> = ({
    value, setValue,
}) => {

    return (
        <>

            <Box sx={{ m: 2 }}>
                <Autocomplete
                    sx={{
                        width: '50rem',
                    }}
                    multiple
                    options={[]}
                    freeSolo
                    onChange={ (_e, value) => setValue(value) }
                    value={value || null}
                    renderTags={
                        (value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...props } = getTagProps({
                                    index
                                });
                                return (
                                    <Chip
                                        label={option}
                                        key={key}
                                        {...props}
                                    />
                                );
                            })
                    }
                    renderInput={
                        (params) =>
                            <TextField
                                label="Keywords"
                                helperText="Topic keywords (optional) - hit Enter after each keyword"
                                
                                {...params}
                            />
                    }
                />

            </Box>

        </>

    );

}

export default Keywords;

