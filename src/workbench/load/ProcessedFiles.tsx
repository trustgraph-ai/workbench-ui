
import React from 'react';

import {
    Box, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import { Check } from '@mui/icons-material';

interface ProcessedFilesProps {
    uploaded : string[],
}

const ProcessedFiles : React.FC<ProcessedFilesProps> = ({
    uploaded
}) => {

    return (
        <>
            <Box>
                <List dense={true} sx={{width: '20rem'}}>
                    {
                        uploaded.map(
                            (file, ix) => (
                                <ListItem
                                    key={ix}
                                >
                                    <ListItemIcon>
                                        <Check/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file}
                                    />
                                </ListItem>
                            )
                        )
                    }
                </List>
            </Box>
        </>
    );

}

export default ProcessedFiles;

