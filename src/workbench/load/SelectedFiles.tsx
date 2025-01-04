
import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import DeleteForever from '@mui/icons-material/DeleteForever';

import { useLoadStateStore } from '../state/LoadState';

interface SelectedFilesProps {
}

const SelectedFiles : React.FC<SelectedFilesProps> = ({
}) => {

    const files = useLoadStateStore((state) => state.files);
    const removeFile = useLoadStateStore((state) => state.removeFile);

    const remove = (file : File) => {
        removeFile(file);
    }

    return (
        <>
            <Box>
                <List dense={true} sx={{width: '20rem'}}>
                    {
                        Array.from(files).map(
                            (file, ix) => (
                                <ListItem
                                    key={ix}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => remove(file)}
                                        >
                                             <DeleteForever />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={file.name}
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

export default SelectedFiles;

