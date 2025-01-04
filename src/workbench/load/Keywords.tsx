
import React from 'react';

import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';

import { useLoadStateStore } from '../state/LoadState';

interface KeywordsProps {}

const Keywords : React.FC<KeywordsProps> = ({
}) => {

    const value = useLoadStateStore((state) => state.keywords);
    const setValue = useLoadStateStore((state) => state.setKeywords);


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

