
import React from 'react';

import {
    Card, CardContent, CardHeader, Typography, Modal
} from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

interface SearchHelpProps {
    open : boolean;
    onClose : () => void;
};

const SearchHelp : React.FC <SearchHelpProps> = ({
    open, onClose
}) => {

    return (
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="Search help"
                aria-describedby="This is the search assistant which lets you enter terms for semantic matching against known entities in the knowledge graph"
            >
            <Card
                sx={{
                    m: 1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                }}
            >
                <CardHeader
                    avatar={<Lightbulb color="primary"/>}
                    title="Search assistant"
                    titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                    <Typography variant="body1">
                        The Search assistant lets you enter terms for
                        semantic matching against known entities in the
                        knowledge graph.  Just enter a natural language
                        term, and the search assistant will find things
                        that closely match what you enter.
                    </Typography>
                </CardContent>
            </Card>
            </Modal>
    );

}

export default SearchHelp;

