
import React from 'react';

import { Box } from '@mui/material';

interface SelectedFilesProps {
    files : File[],
}

const SelectedFiles : React.FC<SelectedFilesProps> = ({
    files, setFiles, submit,
}) => {

    return (
        <>
            <Box>
                {
                    Array.from(files).map(
                        (file, ix) => (
                            <Box key={ix} sx={{m:2}}>
                            File: {file.name}
                            </Box>
                        )
                    )
                }
            </Box>
        </>
    );

}

export default SelectedFiles;

