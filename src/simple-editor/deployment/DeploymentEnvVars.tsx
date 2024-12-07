
import React from 'react'

interface DeploymentEnvVarsProps {
    variables : {
        name : string;
        value : string;
    }[];
};

const DeploymentEnvVars : React.FC<DeploymentEnvVarsProps> =
({variables}) => {

    return (
        <pre>
            {
                variables.map(
                    (va) => {
                        return (
                            <React.Fragment key={va.name}>
                                export {va.name}=<span className="variable">
                                    {va.value}
                                </span>
                                <br/>
                            </React.Fragment>
                        );
                    }
                )
            }
        </pre>
    );
}

export default DeploymentEnvVars;

