
import React from 'react';

import { Typography, Box, Stack } from '@mui/material';

import AgentControls from './AgentControls';
import ToolEditor from './ToolEditor';
import { useAgentsStore } from '../state/Agents';

const ConfigureAgents = ({
}) => {

    const tools = useAgentsStore((state) => state.tools);

    const setTools
        = useAgentsStore((state) => state.setTools);

    const [selected, setSelected] = React.useState<string|null>(null);

    const handleSelect = (
        _event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        id: string,
    ) => {
        setSelected(id);
    };

    const addTool = () => {

        const count = tools.length;
        const newId = "custom-tool-" + (count + 1).toString();

        const newTool = {
            id: newId,
            name: "Example knowledge",
            config: { "input": "query" },
            description: "Query a knowledge store for...",
            type: "knowledge-query",
            arguments: [
                {
                    name: "query",
                    type: "string",
                    description: "The search query string",
                }                
            ]
        };

        setTools([...tools, newTool]);
        setSelected(newId);
        
    };

    return (<>

        <Stack direction="row" spacing={2}>

            <Box>

                <Typography variant="h5" component="h2" gutterBottom>
                    Configure Tools
                </Typography>

                <AgentControls
                    selected={selected}
                    handleSelect={handleSelect}
                    addTool={addTool}
                />

            </Box>

            <Stack
                direction="column" spacing={2}
            >
                { (selected != null) &&
                <ToolEditor
                    selected={selected}
                    setSelected={setSelected}
                />
                }

            </Stack>
            
        </Stack>

    </>);
};

export default ConfigureAgents;

