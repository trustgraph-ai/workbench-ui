
import { Typography, Box } from '@mui/material';

const AgentReactPromptHelp = ({
}) => {

    return (

        <Box sx={{ maxWidth: "45rem" }}>

            <Typography variant="body1" component="p" gutterBottom>
                This is an experimental feature.  There is a much structure
                to this prompt, which is designed to indent neatly
                in the final prompt presented to the LLM, which makes the
                indentation look a little strange.
            </Typography>

       </Box>

    );

};

export default AgentReactPromptHelp;

