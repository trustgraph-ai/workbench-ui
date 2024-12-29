
import React from 'react';

import {
    Box, List, ListItem, IconButton, ListItemText
} from '@mui/material';
import { DeleteForever } from '@mui/icons-material';

interface SelectedFilesProps {
    files : File[],
    setFiles : (v : File[]) => void;
}

const SelectedFiles : React.FC<SelectedFilesProps> = ({
    files, setFiles,
}) => {

    const remove = (ix : number) => {
        const updated = Array.from(files).filter((_e,n) => (ix != n));
        setFiles(updated);
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
                                            onClick={() => remove(ix)}
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

