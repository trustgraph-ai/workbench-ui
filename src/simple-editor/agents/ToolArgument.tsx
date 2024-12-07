
import React from 'react';

import { Typography, Box, Button, Grid2 as Grid} from '@mui/material';
import { TextField, FormControl, MenuItem, Select } from '@mui/material';
import { InputLabel, Paper } from '@mui/material';
import { Delete } from '@mui/icons-material';

import { Argument } from '../state/Agents';

interface ToolArgumentProps {
    arg : Argument;
    ix : number;
    setArgName : (n : number, s : string) => void;
    setArgType : (n : number, s : string) => void;
    setArgDescription : (n : number, s : string) => void;
    deleteArg : (n : number) => void;
}

const ToolArgument : React.FC<ToolArgumentProps> = ({
    arg, ix, setArgName, setArgType, setArgDescription, deleteArg,
}) => {

    return (

        <Paper elevation={3} sx={{ p: 3 }}>

            <Typography
                variant="h5" component="h2" gutterBottom
                sx={{ mb: 3 }}
            >
                {'Argument ' + (ix+1) + ': ' + arg.name}
            </Typography>

            <Grid container spacing={2}>

                <Grid size={4}>
                    <TextField
                        fullWidth
                        multiline
                        label="Name"
                        placeholder="arg-name"
                        value={arg.name}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setArgName(
                                    ix,
                                    event.target.value
                                );
                            }
                        }
                    />
                </Grid>

                <Grid size={6}>

                    <FormControl fullWidth>

                        <InputLabel id={ 'arg-type-' + ix }>Type</InputLabel>

                        <Select
                            labelId = { 'arg-type-' + ix }
                            value={arg.type}
                            label="Type"
                            onChange={
                                (e) =>
                                    setArgType(
                                        ix, e.target.value
                                    )
                            }
                        >
                            <MenuItem value="string">
                                string
                            </MenuItem>
                            <MenuItem value="number">
                                number
                            </MenuItem>
                        </Select>

                    </FormControl>

                </Grid>

                <Grid size={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >

                    <Box>
                        <Button
                            startIcon={<Delete/>}
                            variant="contained"
                            onClick={ () => deleteArg(ix) }
                        >
                            Delete
                        </Button>
                    </Box>

                </Grid>


                <Grid size={12}>

                    <TextField
                        fullWidth
                        label="Description"
                        placeholder="This arg can be used..."
                        value={arg.description}
                        multiline
                        rows={2}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setArgDescription(
                                    ix,
                                    event.target.value
                                );
                            }
                        }
                    />

                </Grid>

            </Grid>

        </Paper>

    );

}

export default ToolArgument;

