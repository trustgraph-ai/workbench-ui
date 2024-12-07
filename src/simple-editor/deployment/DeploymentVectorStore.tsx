
import React from 'react';

import { Typography, Box, Paper, Stack } from '@mui/material';
import { Polyline } from '@mui/icons-material';

import { useModelParamsStore } from '../state/ModelParams';

import DeploymentEnvVars from './DeploymentEnvVars';
import DeploymentCode from './DeploymentCode';

const VectorStoreConfiguration = () => {
    const platform = useModelParamsStore((state) => state.platform);

    if ((platform == "podman-compose") || platform == "docker-compose") {

        return <>

            <Typography variant="body2" sx={{ mt: 2 }}>
                To use Pinecone, you you need an API token which must
                be provided in an environment variable.  The API token
                can be created in the Pinecone console of your account.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "PINECONE_API_KEY",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;

    } else {

        return <>

            <Typography variant="body2" sx={{ mt: 2 }}>
                To use Pinecone, you you need an API token which must
                be provided in a Kubernetes secret.
            </Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic pinecone-api-key \<br/>
            {'    '}--from-literal=pinecone-api-key=<span className="variable">PINECONE-API-KEY</span>
            </DeploymentCode>
        </>;

    }

}

const DeploymentModelVector: React.FC<{}> = ({
}) => {

    const vectorDB = useModelParamsStore((state) => state.vectorDB);

    if (vectorDB != "pinecone") return null;

    return <>

        <Box>
            <Paper sx={{ minWidth: 375, mt: 2, p: 2 }} elevation={3}>
                <Stack
                    direction="row" spacing={2}
                    alignItems="center"
                >
                    <Polyline color="primary" fontSize="large"/>
                    <Typography variant="h6" component="h3">
                        <Box>Vector Store configuration</Box>
                    </Typography>
                </Stack>
                <VectorStoreConfiguration/>
            </Paper>
        </Box>

    </>;

};

export default DeploymentModelVector;

