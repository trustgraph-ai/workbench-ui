
import React from 'react';

import { Typography } from '@mui/material';

import { useModelParamsStore } from '../state/ModelParams';

import DeploymentEnvVars from './DeploymentEnvVars';
import DeploymentCode from './DeploymentCode';
import DeploymentStep from './DeploymentStep';

const getInstructions = (model : string) => {
    if (model == "claude") {
        return <>
            <DeploymentStep>
                To use Anthropic Claude, you need a Claude API key.
                Provide the Claude API key in an environment variable
                when runnging the Docker Compose configuration.
            </DeploymentStep>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "CLAUDE_KEY",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "bedrock") {
        return <>
            <Typography variant="body2">
                To use AWS Bedrock, you must have enabled models in the
                AWS Bedrock console.  You must also provide an
                AWS access key ID and secret key.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "AWS_ID_KEY",
                        value: "ID-KEY-HERE"
                    },
                    {
                        name: "AWS_SECRET_KEY",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "azure") {
        return <>
            <Typography variant="body2">
                To use Azure Serverless APIs, you need to have a serverless
                endpoint deployed, and you must also provide an endpoint
                token as an environment variable.
             </Typography>


            <DeploymentEnvVars
                variables={[
                    {
                        name: "AZURE_ENDPOINT",
                        value: "https://ENDPOINT.API.HOST.GOES.HERE/"
                    },
                    {
                        name: "AZURE_TOKEN",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "azure-openai") {
        return <>
            <Typography variant="body2">
                To use Azure's OpenAI APIs, you need to have a serverless
                OpenAI endpoint deployed, and you must also provide an endpoint
                token as an environment variable. In addition, the OpenAI API
                requires an API Version and Model Name to be set. The Model
                Name is set by the user, during the deployment within AzureAI.
             </Typography>


            <DeploymentEnvVars
                variables={[
                    {
                        name: "AZURE_ENDPOINT",
                        value: "https://ENDPOINT.API.HOST.GOES.HERE/"
                    },
                    {
                        name: "AZURE_TOKEN",
                        value: "TOKEN-GOES-HERE"
                    },
                    {
                        name: "API_VERSION",
                        value: "API-VERSION-GOES-HERE"
                    },
                    {
                        name: "OPENAI_MODEL",
                        value: "USER-DEFINED-MODEL-NAME-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "cohere") {
        return <>
            <Typography variant="body2">
                To use Cohere APIs, you need an API token which must
                be provided in an environment variable.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "COHERE_KEY",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "googleaistudio") {
        return <>
            <Typography variant="body2">
                To use Google AI Studio APIs, you need an API token which
                must be provided in an environment variable.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "GOOGLE_AI_STUDIO_KEY",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "llamafile") {
        return <>
            <Typography variant="body2">
                To use Llamafile, you must have a Llamafile services running
                on an accessible host.  The Llamafile host must be provided
                in an environment variable.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "LLAMAFILE_URL",
                        value: "LLAMAFILE-URL"
                    }
                ]}
            />

        </>;
    } else if (model == "ollama") {
        return <>
            <Typography variant="body2">
                The power of Ollama is the flexibility it provides in
                Language Model deployments. Being able to run LMs with
                Ollama enables fully secure AI TrustGraph pipelines
                that aren't relying on any external APIs. No data is
                leaving the host environment or network.
                The Ollama service must be running, and have required
                models available using <code>ollama pull</code>.
                The Ollama service URL must be provided in an environment
                variable.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "OLLAMA_HOST",
                        value: "http://ollama-host:11434"
                    }
                ]}
            />

            <Typography variant="body2">
                Replace the URL with the URL of your Ollama service.
            </Typography>
        </>;
    } else if (model == "openai") {
        return <>

            <Typography variant="body2">
                To use OpenAI APIs, you need an API
                token which must be provided in an environment variable.
            </Typography>

            <DeploymentEnvVars
                variables={[
                    {
                        name: "OPENAI_TOKEN",
                        value: "TOKEN-GOES-HERE"
                    }
                ]}
            />

        </>;
    } else if (model == "vertexai") {
        return <>
            <Typography variant="body2">
            To use VertexAI, you need to have a Google Cloud credential
            file provisioned for a service account which has access to the
            VertexAI services.  This means signing up to GCP and using
            an existing, or launching a new GCP project.
            The GCP credential will be a JSON file
            which should be stored in <code>vertexai/private.json</code>.
            </Typography>
            <Typography variant="body2">
            The credential file is mounted as a volume in Docker Compose,
            which can cause issues with SELinux if you are running on Linux.
            Make sure that Docker has access to volume files if this
            affects you.
            </Typography>
            <DeploymentCode>
                chcon -Rt svirt_sandbox_file_t vertexai/
            </DeploymentCode>
        </>;
    } else {
        return <> </>;
    }
   
}

const DeploymentModel: React.FC<{}> = ({
}) => {

    const modelDeployment = useModelParamsStore(
        (state) => state.modelDeployment
    );

    const instructions = getInstructions(modelDeployment);

    return instructions;

};

export default DeploymentModel;

