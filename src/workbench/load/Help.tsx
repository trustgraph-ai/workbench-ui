
import React from 'react';

import {
    Card, CardContent, CardHeader, Typography, Modal
} from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

interface HelpProps {
    open : boolean;
    onClose : () => void;
};

const Help : React.FC <HelpProps> = ({
    open, onClose
}) => {

    return (
            <Modal
                open={open}
                onClose={onClose}
            >
            <Card
                sx={{
                    m: 1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40rem',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                }}
            >
                <CardHeader
                    avatar={<Lightbulb color="primary"/>}
                    title="Load"
                    titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                    <Typography variant="body1" sx={{mb: 1}}>
                        The Load page lets you ingest new data into
                        TrustGraph processing.  There are 3 operations:
                    </Typography>
                    <Typography variant="body1" component="ul" sx={{mb: 1}}>
                            <li>Upload PDF - for PDF documents</li>
                            <li>
                                Upload text - for text and markdown
                                documents
                            </li>
                            <li>
                                Paste text - for copy/pasting or
                                typing a snippet of text.
                            </li>
                    </Typography>
                    <Typography variant="body1">
                        Note that Upload simply initiates the processing;
                        it may take many minutes / hours or even days to
                        complete processing large documents.  You would
                        see some elements of documents begin appearing
                        in the workbench within a couple of minutes of
                        document upload.
                    </Typography>
                </CardContent>
            </Card>
            </Modal>
    );

}

export default Help;

