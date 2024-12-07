

import { Stack } from '@mui/material';
import { Psychology, ChatBubble } from '@mui/icons-material';
import { useDeploymentStore } from '../state/Deployment';

import {
    useOptionsStore, CONFIGURE_PROMPTS, CONFIGURE_AGENTS
} from '../state/Options';

import Option from './Option';

const ParamsForm: React.FC = ({
}) => {

    const options = useOptionsStore((state) => state.options);

    const setOptions = useOptionsStore((state) => state.setOptions);

    const setConfigUrl =
        useDeploymentStore((state) => state.setConfigUrl);

    useOptionsStore.subscribe(() => {
        setConfigUrl("");
    });

    const configurePrompts = options.has(CONFIGURE_PROMPTS);
    const configureAgents = options.has(CONFIGURE_AGENTS);

    const set = (o : string, value : boolean) => {
        if (value) {
            const opts = new Set(options);
            opts.add(o);
            setOptions(opts);
        } else {
            const opts = new Set(options);
            opts.delete(o);
            setOptions(opts);
        }
    }

    const onConfigurePrompts = () => {
        set(CONFIGURE_PROMPTS, !configurePrompts);
    };

    const onConfigureAgents = () => {
        set(CONFIGURE_AGENTS, !configureAgents);
    };

    return (
        <>

            <Stack direction="row" spacing={2}
                sx={{flexWrap: 'wrap'}} useFlexGap
            >

                <Option
                    enabled={configurePrompts}
                    onChange={onConfigurePrompts}
                    avatar={<ChatBubble color="primary"/>}
                    title="Data Extraction Prompts"
                    content={
                        'Tailor the LLM system prompts, data extraction prompts, and RAG query prompts.'
                    }

                />

                <Option
                    enabled={configureAgents}
                    onChange={onConfigureAgents}
                    avatar={<Psychology color="primary"/>}
                    title="Agent Definitions"
                    content={
                        'Add Agents that use a ReAct approach. Customize the Agent definitions, options, and arguments.'
                    }

                />

            </Stack>

        </>

    );
};

export default ParamsForm;

