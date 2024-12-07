
import { Typography, Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { Delete } from '@mui/icons-material';

import Prompt from './Prompt';
import { usePromptsStore } from '../state/Prompts';

import { helpInformation } from './help';

interface PromptEditorProps {
    selected : string;
    deletePrompt : () => void;
    setPrompt : (prompt : string) => void;
    setId : (id : string) => void;
    setName : (name : string) => void;
}

const PromptEditor : React.FC<PromptEditorProps> = ({
    selected, deletePrompt, setPrompt, setId, setName,
}) => {

    const prompts = usePromptsStore((state) => state.prompts);

    let prompt : any = null;
    for (let p of prompts) {
       if (p.id == selected) prompt = p;
    }

    return (

        <>
            <Typography
                variant="h5" component="h2" gutterBottom
            >
                { prompt.name }
            </Typography>

            {
                (helpInformation[selected]) &&
                <Box>
                    { helpInformation[selected] }
                </Box>
            }

            {
                prompt.custom && (
                    <Box>
                        <TextField
                          fullWidth
                          label="ID"
                          value={prompt.id}
                          onChange={
                              (event: React.ChangeEvent<HTMLInputElement>) => {
                                  setId(event.target.value);
                              }
                          }
                          margin="normal"
                        />
                        <TextField
                          fullWidth
                          label="Name"
                          value={prompt.name}
                          onChange={
                              (event: React.ChangeEvent<HTMLInputElement>) => {
                                  setName(event.target.value);
                              }
                          }
                          margin="normal"
                        />
                    </Box>
                )
            }

            <Box>
                <Prompt
                    value={prompt.prompt}
                    onChange={setPrompt}
                />
            </Box>

            <Box>

                {
                    prompt.custom && 
                <Button
                    startIcon={<Delete/>}
                    variant="contained"
                    onClick={ deletePrompt }
                >
                    Delete this prompt
                </Button>
                }

            </Box>

        </>
    );

}

export default PromptEditor;


