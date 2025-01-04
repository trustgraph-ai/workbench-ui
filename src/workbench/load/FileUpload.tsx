
import React from 'react';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import PostAddIcon from '@mui/icons-material/PostAdd';
import InputIcon from '@mui/icons-material/Input';

import SelectedFiles from './SelectedFiles';
import ProcessedFiles from './ProcessedFiles';
import { useLoadStateStore } from '../state/LoadState';
import { Typography } from '../../../node_modules/@mui/material/index';

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
    submit : () => void;
    kind : string;
}

const FileUpload : React.FC<FileUploadProps> = ({
    submit, kind,
}) => {

    const files = useLoadStateStore((state) => state.files);
    const setFiles = useLoadStateStore((state) => state.setFiles);

    const fl2a = (x : FileList | null) : File[] => {
        if (x)
            return Array.from(x);
        else
            return [];
    }

    return (
        <>
            
            <Box>

                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<PostAddIcon />}
                  sx={{ m: 1 }}
                >
                    Select {kind} files
                    <VisuallyHiddenInput
                      type="file"
                      onChange={
                          (event) =>
                               setFiles(fl2a(event.target.files))
                      }
                      multiple
                    />
                </Button>

                <Button
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={submit}
                    disabled={files.length < 1}
                    startIcon={<InputIcon />}
                >
                    Load
                </Button>

            </Box>

            <Box>
                <SelectedFiles/>
            </Box>

            <Box>
                <ProcessedFiles/>
            </Box>
            
        </>
    );

}

export default FileUpload;

