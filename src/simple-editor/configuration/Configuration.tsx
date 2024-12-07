
import React from 'react';

import { Box, Tabs, Tab } from '@mui/material';

import { usePromptsStore } from '../state/Prompts';
import {
    useOptionsStore, CONFIGURE_PROMPTS, CONFIGURE_AGENTS,
} from '../state/Options';
import { useDeploymentStore } from '../state/Deployment';

import ConfigurePrompts from '../prompts/ConfigurePrompts';
import ConfigureAgents from '../agents/ConfigureAgents';
import Additional from './Additional';
import GenerateDeployment from './GenerateDeployment';
import Parameters from './Parameters';

interface TabPanelProps {
    children?: React.ReactNode;
    tabId: string;
    value: string;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, tabId, value, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== tabId}
            id={`simple-tabpanel-${tabId}`}
            aria-labelledby={`simple-tab-${tabId}`}
            {...other}
        >
            {value === tabId && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const tabs = (opts : Set<string>) => {

    let tabs = [
        <Tab key="model" value="model" label="Component Selection ✅"/>,
        <Tab key="more" value="more" label="Customization 🧰"/>
    ];

    if (opts.has(CONFIGURE_PROMPTS))
        tabs.push(
            <Tab key="prompts" value="prompts" label="Configure Prompts"/>
        );

    if (opts.has(CONFIGURE_AGENTS))
        tabs.push(
            <Tab key="agents" value="agents" label="Configure Agents"/>
        );

    tabs.push(<Tab key="depl" value="depl" label="Finish Deployment 🚀"/>);

    return tabs;

}

const Configuration: React.FC = () => {

    const [value, setValue] = React.useState("model");

    const setConfigUrl =
        useDeploymentStore((state) => state.setConfigUrl);

    usePromptsStore.subscribe(() => {
        setConfigUrl("");
    });

    const handleChange = (_event: React.SyntheticEvent, value: string) => {
        setValue(value);
    };

    const options
        = useOptionsStore((state) => state.options);

    return (

        <>

            <Box className="configuration">

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value} onChange={handleChange}
                    variant="scrollable"
                >
                    {tabs(options)}
                </Tabs>
            </Box>

            <CustomTabPanel value={value} tabId="model">
                <Parameters/>
            </CustomTabPanel>

            <CustomTabPanel value={value} tabId="more">
                <Additional/>
            </CustomTabPanel>

            <CustomTabPanel value={value} tabId="prompts">
                <ConfigurePrompts/>
            </CustomTabPanel>

            <CustomTabPanel value={value} tabId="agents">
                <ConfigureAgents/>
            </CustomTabPanel>

            <CustomTabPanel value={value} tabId="depl">
               <GenerateDeployment/>
            </CustomTabPanel>

            </Box>

        </>

    )

}

export default Configuration;

