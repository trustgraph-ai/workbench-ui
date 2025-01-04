
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import Lightbulb from '@mui/icons-material/Lightbulb';

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
                    title="Explore"
                    titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                    <Typography variant="body1" sx={{mb: 1}}>
                        The Explore page shows properties and
                        relationships of entities in the knowledge graph.
                        On this page, you can navigate by selecting other
                        knowledge graph entities and seeing the properties
                        and relationships related to those entities.
                    </Typography>
                    <Typography variant="body1">
                        Selecting the Graph View button shows you the
                        same information, but presented in a 3D graphical
                        form.
                    </Typography>
                </CardContent>
            </Card>
            </Modal>
    );

}

export default Help;

