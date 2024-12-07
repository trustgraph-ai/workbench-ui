
import React from 'react';

import { useDeploymentStore } from '../state/Deployment';

import ConfigGeneration from './ConfigGeneration';
import PreparedConfig from './PreparedConfig';

interface DeploymentConfigProps {
}

const DeploymentConfig: React.FC<DeploymentConfigProps> = ({
}) => {

    const configUrl
        = useDeploymentStore((state) => state.configUrl);

    if (configUrl) {
        return <PreparedConfig/>;
    } else {
        return <ConfigGeneration/>;
    }

};

export default DeploymentConfig;

