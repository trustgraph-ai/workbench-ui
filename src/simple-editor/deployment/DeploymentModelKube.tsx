
import React from 'react';

import { Typography, Alert } from '@mui/material';

import { useModelParamsStore } from '../state/ModelParams';

import DeploymentCode from './DeploymentCode';
import DeploymentStep from './DeploymentStep';

const getInstructions = (model : string) => {
    if (model == "claude") {
        return <>
            <DeploymentStep>
                To use Anthropic Claude, you need a Claude API key.
                Provide the Claude API key in a Kubernetes secret
                before deploying the application.
            </DeploymentStep>


            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic claude-credentials \<br/>
            {'    '}--from-literal=claude-key=<span className="variable">CLAUDE_KEY</span>
            </DeploymentCode>

        </>;
    } else if (model == "bedrock") {
        return <>
            <Typography variant="body2">
                To use AWS Bedrock, you must have enabled models in the
                AWS Bedrock console.  You must also provide an
                AWS access key ID and secret key as a Kubernetes secret
                before deploying the application.
            </Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic bedrock-credentials \<br/>
            {'    '}--from-literal=aws-id-key=<span className="variable">AWS-ID-KEY</span> \<br/>
            {'    '}--from-literal=aws-secret-key=<span className="variable">AWS-SECRET-KEY</span>
            </DeploymentCode>

        </>;
    } else if (model == "azure") {
        return <>
            <Typography variant="body2">
                To use Azure Serverless APIs, you need to have a serverless
                endpoint deployed.  You must also provide
                an Azure endpoint and token in a Kubernetes secret before
                launching the application.
             </Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic azure-credentials \<br/>
            {'    '}--from-literal=azure-endpoint=<span className="variable">AZURE-ENDPOINT</span> \<br/>
            {'    '}--from-literal=azure-token=<span className="variable">AZURE-TOKEN</span>
            </DeploymentCode>

        </>;
    } else if (model == "cohere") {
        return <>
            <Typography variant="body2">To use Cohere APIs, you need an API token which must
            be provided in a Kubernetes secret.</Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic cohere-credentials \<br/>
            {'    '}--from-literal=cohere-key=<span className="variable">COHERE-KEY</span>
            </DeploymentCode>

        </>;
    } else if (model == "llamafile") {
        return <>
            <Typography variant="body2">To use Llamafile, you must have a Llamafile services running
            on an accessible host.  The Llamafile host must be provided
            in a Kubernetes secret.</Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic llamafile-credentials \<br/>
            {'    '}--from-literal=llamafile-url=<span className="variable">http://llamafile:1234/</span>
            </DeploymentCode>

        </>;
    } else if (model == "ollama") {
        return <>
            <Typography variant="body2">
                The Ollama service URL must be provided in a Kubernetes
                secret.
            </Typography>

            <DeploymentCode>
            kubectl -n trustgraph \<br/>
            {'    '}create secret generic ollama-credentials \<br/>
            {'    '}--from-literal=ollama-host=<span className="variable">http://ollama:11434/</span>
            </DeploymentCode>

            <Typography variant="body2">
                Replace the URL with the URL of your Ollama service.
            </Typography>
        </>;
    } else if (model == "openai") {
        return <>
            <Typography variant="body2">To use OpenAI APIs, you need an API token which must
            be provided in a Kubernetes secret.</Typography>

            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic openai-credentials \<br/>
            {'    '}--from-literal=openai-key=<span className="variable">OPENAI-KEY</span>
            </DeploymentCode>

        </>;
    } else if (model == "vertexai") {
        return <>
            <Typography variant="body2">
            To use VertexAI, you need to have a Google Cloud credential
            file provisioned for a service account which has access to the
            VertexAI services.  This means signing up to GCP and using
            an existing, or launching a new GCP project.
            The GCP credential will be a JSON file
            which would arrive in a file called <code>private.json</code>.
            </Typography>
            <Typography variant="body2" sx={{mt: 1}}>
            The private.json file should be loaded into Kubernetes as a
            secret.
            </Typography>
            <DeploymentCode>
            kubectl -n trustgraph create secret \<br/>
            {'    '}generic vertexai-creds --from-file=private.json=private.json
            </DeploymentCode>
            <Alert severity="warning">
                Google Cloud private.json files are secrets which potentially
                provide access to all of your Google Cloud resources.
                Take great care to ensure that the permissions of the
                account are minimal, ideally scope to just AI services.
            </Alert>
        </>;
    } else {
        return <> </>;
    }
   
}

const DeploymentModelKube: React.FC<{}> = ({
}) => {

    const modelDeployment = useModelParamsStore((state) => state.modelDeployment);

    const instructions = getInstructions(modelDeployment);

    return (

        <>
            {instructions}
        </>

    );
};

export default DeploymentModelKube;

