import React from 'react';

import {
    FormControl, InputLabel, Select, MenuItem, Box, Stack, Divider,
    Typography,
} from '@mui/material';

interface VectorDBProps {
  value: string;
  onChange: (value: string) => void;
}

const VectorDB: React.FC<VectorDBProps> = ({ value, onChange }) => {
  return (

        <FormControl fullWidth>

            <InputLabel id="vector-db-label">Vector DB</InputLabel>


            <Select
                labelId="vector-db-label"
                id="vector-db-select"
                value={value}
                label="Vector store"
                onChange={(e) => onChange(e.target.value)}
                sx={{minHeight: 100}}
            >

                <MenuItem value="qdrant">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical" flexItem />
                        }
                        alignItems="stretch"
                    >
                        <Stack sx={{width: 100}} direction="column"
                            alignItems="center" justifyContent="center"
                        >

                            <img src="qdrant.png" width="90"/>

                        </Stack>

                        <Box sx={{
                            width: '36rem'
                        }}>
                            <Typography variant="body2"
                                sx={{ whiteSpace: 'wrap' }}
                            >

                                Qdrant is the most advanced vector
                                database with highest RPS, minimal
                                latency, fast indexing, high control
                                with accuracy, and so much more.
                                                                
                            </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="milvus">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                        alignItems="center" justifyContent="center"
                        >
                            <img src="milvus.svg" width="100"/>
                            </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                                Milvus is an open-source vector database
                                built for GenAI applications. Install with
                                pip, perform high-speed searches, and
                                scale to tens of billions of vectors with
                                minimal performance loss.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="pinecone">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                        alignItems="center" justifyContent="center"
                        >
                            <img src="pinecone.svg" width="80"/>
                            </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                            Pinecone offers a fully managed, serverless
                            vector database with an easy-to-use API.
                            Developer-friendly and fully scalable.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

            </Select>

        </FormControl>

  );
};

export default VectorDB;