
import React from 'react'

interface DeploymentCodeProps extends React.PropsWithChildren {
    children : React.ReactNode;
};

const DeploymentCode : React.FC<DeploymentCodeProps> =
({children}) => {
    return (
        <pre>
            {children}
        </pre>
    );
}

export default DeploymentCode;

