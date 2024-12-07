
import React from 'react';

import {
    FormControl, InputLabel, Select, MenuItem, Box, Stack, Divider,
    Typography, TextField,
} from '@mui/material';

interface ChunkerProps {
  type: string;
  chunkSize: number;
  chunkOverlap: number;
  onTypeChange: (value: string) => void;
  onChunkSizeChange: (value: number) => void;
  onChunkOverlapChange: (value: number) => void;
}

const Chunker: React.FC<ChunkerProps> = ({
  type,
  chunkSize,
  chunkOverlap,
  onTypeChange,
  onChunkSizeChange,
  onChunkOverlapChange,
}) => {
  return (

      <div>

          <FormControl fullWidth>

              <InputLabel id="graph-store-label">Chunker type</InputLabel>

              <Select
                  labelId="chunker-type-label"
                  id="chunker-type-select"
                  value={type}
                  label="Chunker type"
                  onChange={(e) => onTypeChange(e.target.value)}
                  sx={{minHeight: 120}}
              >

                  <MenuItem value="chunker-recursive">
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
                              Recursive                        </Stack>

                          <Box sx={{
                              width: '36rem'
                          }}>
                              <Typography variant="body2"
                                  sx={{ whiteSpace: 'wrap' }}
                              >

                                  This chunker tries different chunk
                                  separators until the chosen chunk size
                                  is achieved.  The chunk size and
                                  overlap values are counted in characters.
                                  Values such as chunk size 1000, overlap 100
                                  are a good starting point.

                              </Typography>
                          </Box>
                      </Stack>
                  </MenuItem>

                  <MenuItem value="chunker-token">
                      <Stack
                          direction="row" spacing={2}
                          divider={
                              <Divider orientation="vertical"
                              flexItem
                          />}>
                          <Stack sx={{width: 100}} direction="row"
                              alignItems="center" justifyContent="center"
                          >
                              Token
                          </Stack>
                          <Box sx={{
                              width: '36rem'
                          }}>

                          <Typography variant="body2"
                              sx={{ whiteSpace: 'wrap' }}
                          >

                              A tokenizer breaks unstructured data and
                              natural language text into chunks of
                              information that can be considered as
                              discrete elements.  This avoids breaking
                              words.  The chunk size and overlap values
                              are counted in tokens.  Values such as
                              chunk size 100, overlap 10 may be a good
                              starting point.

                          </Typography>
                          </Box>
                      </Stack>
                  </MenuItem>

              </Select>
          </FormControl>

          <TextField
              fullWidth
              label="Chunk size"
              type="number"
              value={chunkSize}
              onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
              margin="normal"
          />

          <TextField
              fullWidth
              label="Chunk overlap"
              type="number"
              value={chunkOverlap}
              onChange={(e) => onChunkOverlapChange(parseInt(e.target.value))}
              margin="normal"
          />

      </div>

  );
};

export default Chunker;

