
import React from 'react';

import { Psychology } from '@mui/icons-material';
import {
    Typography, Paper, Box, Stack,
} from '@mui/material';

import { useModelParamsStore } from '../state/ModelParams';

import DeploymentModelCompose from './DeploymentModelCompose';
import DeploymentModelKube from './DeploymentModelKube';

interface DeploymentModelProps {
}

const Platform = () => {

    const platform = useModelParamsStore((state) => state.platform);

    if (platform == "docker-compose" || platform == "podman-compose") {
        return <DeploymentModelCompose/>;
    } else if (platform == "minikube-k8s" || platform == "gcp-k8s") {
        return <DeploymentModelKube/>;
    } else {
        return <div>Bunch</div>;
    }

}

const DeploymentModel: React.FC<DeploymentModelProps> = ({
}) => {


    return (

        <>
            <Box>
                <Paper sx={{ minWidth: 375, mt: 2, p: 2 }} elevation={3}>
                    <Typography variant="h6" component="h3">
                        <Stack
                            direction="row" spacing={2}
                            alignItems="center"
                            sx={{mt: 2, mb: 2}}
                        >
                            <Psychology color="primary" fontSize="large"/>
                            <Box>Model Credentials</Box>
                        </Stack>
                    </Typography>
                    <Platform/>
                </Paper>
            </Box>
        </>

    );
};

export default DeploymentModel;

