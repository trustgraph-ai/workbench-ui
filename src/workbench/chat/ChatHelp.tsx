
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import Lightbulb from '@mui/icons-material/Lightbulb';

interface ChatHelpProps {
    open : boolean;
    onClose : () => void;
};

const ChatHelp : React.FC <ChatHelpProps> = ({
    open, onClose
}) => {

    return (
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="Chat help"
                aria-describedby="This is chat assistant which lets you converse with the assistant in natural language. Behind the scenes, the assistant uses the knowledge graph to answer questions."
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
                    title="Chat assistant"
                    titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                    <Typography variant="body1">
                        The Chat assistant lets you converse with the
                        assistant in natural language.  The assistant has
                        access to all of the information in the knowledge
                        graph and will use the knowledge graph to provide
                        information to you.
                    </Typography>
                </CardContent>
            </Card>
            </Modal>
    );

}

export default ChatHelp;

