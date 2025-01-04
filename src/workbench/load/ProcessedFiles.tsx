
import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Check from '@mui/icons-material/Check';

import { useLoadStateStore } from '../state/LoadState';

interface ProcessedFilesProps {
}

const ProcessedFiles : React.FC<ProcessedFilesProps> = ({
}) => {

    const uploaded = useLoadStateStore((state) => state.uploaded);

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

