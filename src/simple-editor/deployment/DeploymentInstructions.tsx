
import React from 'react';

import {
    Typography, Box, Paper, Stack,
} from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';

import { useModelParamsStore } from '../state/ModelParams';
import DeploymentCode from './DeploymentCode';
import DeploymentStep from './DeploymentStep';

const DeploymentInstructionsCompose = () => {

    const platform = useModelParamsStore((state) => state.platform);

    return (

        <>

            <Box>
                <Paper sx={{ minWidth: 375, mt: 2, p: 2 }} elevation={3}>
                    <Stack
                        direction="row" spacing={2}
                        alignItems="center"
                        sx={{mb: 2}}
                    >
                        <RocketLaunch color="primary" fontSize="large"/>
                        <Typography variant="h6" component="h3">
                            Launch
                        </Typography>
                    </Stack>

                    <DeploymentStep>

                        When you download the deploy configuration, you will
                        have a ZIP file containing all the configuration
                        needed to launch TrustGraph in
                        {
                            platform == "podman-compose" ? 
                            " Podman Compose" :
                            " Docker Compose"
                        }.
                        Unzip the ZIP file:

                    </DeploymentStep>

                    <DeploymentCode>
                        unzip deploy.zip
                    </DeploymentCode>

                    <DeploymentStep>

                    On MacOS, it may be necessary to specify a destination directory for the TrustGraph package:

                    </DeploymentStep>

                    <DeploymentCode>
                        unzip deploy.zip -d deploy
                    </DeploymentCode>

                    <DeploymentStep>

                        Navigate to the <code>docker-compose</code> directory. From this directory, launch TrustGraph with:

                    </DeploymentStep>

                    <DeploymentCode>
                        {platform == "podman-compose" ? "podman compose" : "docker compose" } -f docker-compose.yaml up -d
                    </DeploymentCode>

                    <DeploymentStep>

                        If you are on Linux, running SELinux, you may need
                        to change permissions on files in the deploy bundle
                        so that they are accessible from within containers.
                        This affects
                        the <code>grafana</code> and <code>prometheus</code> directories.
                    </DeploymentStep>
                        
                    <DeploymentCode>
                        chcon -Rt svirt_sandbox_file_t grafana prometheus<br/>
                        chmod 755 prometheus/ grafana/ grafana/*/<br/>
                        chmod 644 prometheus/* grafana/*/*
                    </DeploymentCode>

                </Paper>
            </Box>

        </>

    );

}

const DeploymentInstructionsKube = () => {

    return (

        <>

            <Box>
                <Paper sx={{ minWidth: 375, mt: 2, p: 2 }} elevation={3}>
                    <Stack
                        direction="row" spacing={2}
                        alignItems="center"
                        sx={{mb: 2}}
                    >
                        <RocketLaunch color="primary" fontSize="large"/>
                        <Typography variant="h6" component="h3">
                            Launch
                        </Typography>
                    </Stack>

                    <DeploymentStep>

                        When you download the deploy configuration, you will
                        have a ZIP file containing all the configuration
                        needed to launch TrustGraph on Kubernetes.
                        Unzip the ZIP file...

                    </DeploymentStep>

                    <DeploymentCode>
                        unzip deploy.zip
                    </DeploymentCode>

                    <DeploymentStep>

                        and launch...

                    </DeploymentStep>

                    <DeploymentCode>
                        kubectl apply -f resources.yaml
                    </DeploymentCode>

                </Paper>
            </Box>

        </>

    );

}

const DeploymentInstructions: React.FC<{}> = ({
}) => {

    const platform = useModelParamsStore((state) => state.platform);

    if (platform == "docker-compose" || platform == "podman-compose")
        return <DeploymentInstructionsCompose/>;
    else
        return <DeploymentInstructionsKube/>;

};

export default DeploymentInstructions;

