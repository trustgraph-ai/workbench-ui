
import React from 'react';

import { Typography, Box, Grid2 as Grid} from '@mui/material';
import { TextField, FormControl, MenuItem, Select } from '@mui/material';
import { InputLabel, Stack, Divider, Paper } from '@mui/material';

import { Tool } from '../state/Agents';

interface ToolDefinitionProps {
    tool : Tool;
    setId : (s : string) => void;
    setName : (s : string) => void;
    setType : (s : string) => void;
    setDescription : (s : string) => void;
}

const ToolDefinition : React.FC<ToolDefinitionProps> = ({
    tool, setId, setName, setType, setDescription,
}) => {

    return (

        <Paper elevation={3} sx={{p: 3}}>

{/*
            <Typography variant="h5" component="h2" gutterBottom>
                Definition
            </Typography>
*/}

            <Grid container spacing={2}>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        multiline
                        label="ID"
                        placeholder="example-query"
                        value={tool.id}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setId(event.target.value);
                            }
                        }
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        fullWidth
                        multiline
                        label="Name"
                        placeholder="Example tool name"
                        value={tool.name}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setName(event.target.value);
                            }
                        }
                    />
                </Grid>

                <Grid size={12}>
                    <FormControl fullWidth>

                        <InputLabel id="type-label">Options</InputLabel>

                        <Select
                            labelId="type-label"
                            id="type-select"
                            value={tool.type}
                            label="Options"
                            onChange={(e) => setType(e.target.value)}
                            sx={{minHeight: '6rem'}}
                        >

                            <MenuItem value="knowledge-query">
                                <Stack
                                    direction="row" spacing={2}
                                    divider={
                                        <Divider orientation="vertical" flexItem/>
                                    }
                                >

                                    <Stack
                                        sx={{width: '18rem' }}
                                        direction="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        textAlign="center"
                                    >
                                        GraphRAG Query
                                    </Stack>

                                    <Box sx={{
                                    }}>
                                        <Typography variant="body2"
                                            sx={{ whiteSpace: 'wrap' }}
                                        >
                                            Performs a GraphRAG query.
                                            To be effective, the
                                            description should provide clear,
                                            precise information about what
                                            information the GraphRAG query
                                            should return.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </MenuItem>

                            <MenuItem value="text-completion">
                                <Stack
                                    direction="row" spacing={2}
                                    divider={
                                        <Divider orientation="vertical" flexItem/>
                                    }
                                >

                                    <Stack
                                        sx={{width: '18rem' }}
                                        direction="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        textAlign="center"
                                    >
                                        Text Completion
                                    </Stack>

                                    <Box sx={{
                                    }}>
                                        <Typography variant="body2"
                                            sx={{ whiteSpace: 'wrap' }}
                                        >
                                            Sends a request to
                                            the text completion service to
                                            generate a LLM output without
                                            any additional context. 
                                        </Typography>
                                    </Box>
                                </Stack>
                            </MenuItem>

                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={12}>
                    <TextField
                        fullWidth
                        label="Instructions"
                        multiline
                        placeholder="This tool provides knowledge about..."
                        value={tool.description}
                        rows={5}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setDescription(event.target.value);
                            }
                        }
                    />
                </Grid>

            </Grid>

        </Paper>
    );

}

export default ToolDefinition;

