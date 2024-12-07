
import React from 'react';

import { Typography, Box, Button } from '@mui/material';
import { Stack } from '@mui/material';
import { Delete } from '@mui/icons-material';

import { useAgentsStore, Tool, Argument } from '../state/Agents';
import ToolDefinition from './ToolDefinition';
import ToolArguments from './ToolArguments';

interface ToolEditorProps {
    selected : string;
    setSelected : (id : string | null) => void;
}

const ToolEditor : React.FC<ToolEditorProps> = ({
    selected, setSelected,
}) => {

    const tools = useAgentsStore((state) => state.tools);

    const setTools
        = useAgentsStore((state) => state.setTools);

    const deleteTool = () => {
        const newTools = tools.filter(p => (p.id != selected));
        setTools(newTools);
        if (newTools.length > 0)
            setSelected(newTools[0].id);
        else
            setSelected(null);

    };

    const updateTool = (f : (t : Tool) => Tool) => {
        const newTools = tools.map(
            e => {
                if (e.id == selected) {
                    return f(e);
                } else {
                    return e;
                }
            }
        );
        setTools(newTools);
    };

    const setDescription = (desc : string) => {
        updateTool((t) => ({ ...t, description: desc }));
    };

    const setId = (id : string) => {
        updateTool((t) => ({ ...t, id: id }));
        setSelected(id);
    };

    const setType = (type : string) => {
        updateTool((t) => ({ ...t, type: type }));
    };

    const setName = (name : string) => {
        updateTool((t) => ({ ...t, name: name }));
    };

    const updateArg = (aix : number, f : (a : Argument) => Argument) => {
        updateTool(
            (t : Tool) => ({
                ...t,
                arguments: tool!.arguments.map(
                    (arg : Argument, ix : number) => {
                        if (aix == ix) {
                            return f(arg);
                        } else {
                            return arg;
                        }
                    }
                ),
            })
        );
    };

    const deleteArg = (aix : number) => {
        updateTool(
            (t) => ({
                ...t,
                arguments: tool!.arguments.toSpliced(aix, 1)
            })
        );
    };

    const setArgName = (ix : number, name : string) => {
        updateArg(ix, (a) => ({ ...a, name: name }));
    };

    const setArgType = (ix : number, type : string) => {
        updateArg(ix, (a) => ({ ...a, type: type }));
    };

    const setArgDescription = (ix : number, description : string) => {
        updateArg(ix, (a) => ({ ...a, description: description }));
    };

    const addArgument = () => {
        
        const count = tool!.arguments.length;
        const newName = "arg-" + (count + 1).toString();

        const args = [
            ...tool!.arguments,
            {
                name: newName,
                type: "string",
                description: "Query string for...",
            }
        ];

        updateTool((t) => ({ ...t, arguments: args }));
        
    };

    let tool : Tool | null = null;
    for (let p of tools) {
       if (p.id == selected) {
           tool = p;
           break;
       }
    }

    if (tool == null) return null;

    return (

        <>
            <Typography
                variant="h5" component="h2" gutterBottom
                sx={{ mb: 3 }}
            >
                { tool.name }
            </Typography>

            <Stack spacing={2}>

                <ToolDefinition
                    tool={tool} setId={setId} setName={setName}
                    setType={setType} setDescription={setDescription}
                />

                <ToolArguments
                    tool={tool}
                    setArgName={setArgName}
                    setArgType={setArgType}
                    setArgDescription={setArgDescription}
                    deleteArg={deleteArg}
                />

                <Stack spacing={3} direction="row">

                    <Box>

                        {
                            <Button
                                startIcon={<Delete/>}
                                variant="contained"
                                onClick={ addArgument }
                            >
                                Add Argument
                            </Button>
                        }

                    </Box>

                    <Box>

                        {
                            <Button
                                startIcon={<Delete/>}
                                variant="contained"
                                onClick={ deleteTool }
                            >
                                Delete Tool
                            </Button>
                        }

                    </Box>

                </Stack>

            </Stack>

        </>
    );

}

export default ToolEditor;

