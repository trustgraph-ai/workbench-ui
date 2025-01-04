
import React from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { useLoadStateStore } from '../state/LoadState';

interface ProcessedFilesProps {
}

const ProcessedFiles : React.FC<ProcessedFilesProps> = ({
}) => {

    const uploaded = useLoadStateStore((state) => state.uploaded);

    return (
        <>
            <Box>
                {
                    uploaded.map(
                        (file, ix) => (
                                <Alert severity="success" key={ix}>
                                    {file} uploaded.
                                </Alert>
                        )
                    )
                }
            </Box>
        </>
    );

}

export default ProcessedFiles;

