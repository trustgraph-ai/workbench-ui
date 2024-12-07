
import React from 'react';

import { Typography, Box, Stack } from '@mui/material';

import PromptControls from './PromptControls';
import PromptEditor from './PromptEditor';
import { usePromptsStore } from '../state/Prompts';

const ConfigurePrompts = ({
}) => {

    const prompts = usePromptsStore((state) => state.prompts);

    const setPrompts
        = usePromptsStore((state) => state.setPrompts);

    const [selected, setSelected] = React.useState(prompts[0].id);

    const handleSelect = (
        _event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        id: string,
    ) => {
        setSelected(id);
    };

    const addPrompt = () => {

        const count = prompts.length;
        const newId = "custom-prompt-" + (count + 1).toString();

        const newPrompt = {
            id: newId,
            name: "Custom prompt " + (count + 1).toString(),
            prompt: "",
            custom: true,
        };

        setPrompts([...prompts, newPrompt]);
        setSelected(newId);
        
    };

    const deletePrompt = () => {

        const newPrompts = prompts.filter(p => (p.id != selected));

        setPrompts(newPrompts);
        setSelected(newPrompts[0].id);

    };

    const setPrompt = (newVal : string) => {
        const newPrompts = prompts.map(
            p => {
                if (p.id == selected) {
                    const newP = {
                        ...p,
                        prompt: newVal,
                    };
                    return newP;
                } else {
                    return p;
                }
            }
        );
        setPrompts(newPrompts);
    };

    const setId = (newVal : string) => {
        const newPrompts = prompts.map(
            p => {
                if (p.id == selected) {
                    const newP = {
                        ...p,
                        id: newVal,
                    };
                    return newP;
                } else {
                    return p;
                }
            }
        );
        setPrompts(newPrompts);

        // Have to change ID to point to the new changed ID
        setSelected(newVal);
    };

    const setName = (newVal : string) => {
        const newPrompts = prompts.map(
            p => {
                if (p.id == selected) {
                    const newP = {
                        ...p,
                        name: newVal,
                    };
                    return newP;
                } else {
                    return p;
                }
            }
        );
        setPrompts(newPrompts);
    };

    return (<>

        <Stack direction="row" spacing={2}>

            <Box>

                <Typography variant="h5" component="h2" gutterBottom>
                    Configure Prompts
                </Typography>

                <PromptControls
                    selected={selected}
                    handleSelect={handleSelect}
                    addPrompt={addPrompt}
                />

            </Box>

            <Stack
                direction="column" spacing={2}
            >

                <PromptEditor
                    selected={selected}
                    deletePrompt={deletePrompt}
                    setPrompt={setPrompt}
                    setId={setId}
                    setName={setName}
                />

            </Stack>
            
        </Stack>

    </>);
};

export default ConfigurePrompts;

