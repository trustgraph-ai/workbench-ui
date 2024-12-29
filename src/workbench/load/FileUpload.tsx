
import React from 'react';

import { Button, Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';

import SelectedFiles from './SelectedFiles';
import ProcessedFiles from './ProcessedFiles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface FileUploadProps {
    files : File[],
    setFiles : (value : File[]) => void;
    uploaded : File[],
    setUploaded : (f : string[]) => void;
    submit : () => void;
    kind : string;
}

const FileUpload : React.FC<FileUploadProps> = ({
    files, setFiles, submit, kind, uploaded, setUploaded,
}) => {

    return (
        <>

            <Box>

                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUpload />}
                  sx={{ m: 1 }}
                >
                    Upload {kind} files
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(event) => setFiles(event.target.files)}
                      multiple
                    />
                </Button>

                <Button
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={submit}
                    disabled={files.length < 1}
                >
                    Submit
                </Button>

            </Box>

            <Box>
                <SelectedFiles
                    files={files} setFiles={setFiles}
                />
            </Box>

            <Box>
                <ProcessedFiles
                    uploaded={uploaded}
                />
            </Box>
            
        </>
    );

}

export default FileUpload;

