
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
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                }}
            >
                <CardHeader
                    avatar={<Lightbulb color="primary"/>}
                    title="Visualize"
                    titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                    <Typography variant="body1" sx={{mb: 1}}>
                        The Visualize page projects the knowledge graph
                        into 3 dimensions.  The initial view is centered
                        on a node that you select.  
                    </Typography>
                    <Typography variant="body1">
                        You can use the mouse
                        to drag and rotate the space to explore different
                        parts of the graph.  Clicking on a graph node
                        adds more properties and relationships to the
                        graph centered on that node.
                    </Typography>
                </CardContent>
            </Card>
            </Modal>
    );

}

export default Help;

