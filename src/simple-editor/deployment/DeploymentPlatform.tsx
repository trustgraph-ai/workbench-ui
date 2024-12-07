
import React from 'react';

import {
    Alert
} from '@mui/material';
import { Hub } from '@mui/icons-material';

import { useModelParamsStore } from '../state/ModelParams';

import DeploymentStep from './DeploymentStep';
import DeploymentSection from './DeploymentSection';

const getSteps = (model : string) => {
    if (model == "docker-compose") {
        return <>
            <DeploymentStep>
                You need to have Docker Compose installed.
                See <a href="https://docs.docker.com/compose/install/"
                    target="_blank">
                    Installing Docker Compose
                </a>.
            </DeploymentStep>
        </>;
    } else if (model == "podman-compose") {
        return <>
            <DeploymentStep>
                You need to have the Podman environment and Podman Compose
                installed.  This should be available with your Linux
                distriubution
                See <a href="https://linuxhandbook.com/podman-compose/"
                    target="_blank">
                    Beginner's Guide to Using Podman Compose
                </a>.
            </DeploymentStep>
        </>;
    } else if (model == "minikube-k8s") {
        return <>
            <DeploymentStep>
                You need to have the Minikube cluster installed and
                running.
                See <a href="https://minikube.sigs.k8s.io/docs/start"
                    target="_blank">
                    Minikube - Get Started!
                </a>.  There is TrustGraph documentation on
                Minikube <a href="https://trustgraph.ai/docs/running/minikube" target="_blank">here</a>.
            </DeploymentStep>
        </>;
    } else if (model == "gcp-k8s") {
        return <>
            <DeploymentStep>
                You need to have a Google Cloud account, and a
                running GKE cluster.  You also need to be authenticated
                with the cluster and be able to see the cluster
                state.
                See <a href="https://cloud.google.com/kubernetes-engine"
                target="_blank">Google Kubernetes Engine (GKE)</a>.
            </DeploymentStep>
        </>;
    } else if (model == "pulumi-aws-ecs") {
        return <>
            <Alert severity="error">
                This is not properly implemented or documented.
            </Alert>
        </>;
    } else {
        return <> </>;
    }
   
}

interface DeploymentInstructionsProps {
}

const DeploymentInstructions: React.FC<DeploymentInstructionsProps> = ({
}) => {

    const platform = useModelParamsStore((state) => state.platform);

    const instructions = getSteps(platform);

    return (

        <>
            <DeploymentSection
                avatar={<Hub color="primary" fontSize="large"/>}
                title="Platform preparation"
                children={instructions}
            />
        </>

    );

};

export default DeploymentInstructions;

