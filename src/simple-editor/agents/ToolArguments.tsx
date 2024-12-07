
import React from 'react';

import { Tool, Argument } from '../state/Agents';

import ToolArgument from './ToolArgument';

interface ToolArgumentsProps {
    tool : Tool;
    setArgName : (n : number, s : string) => void;
    setArgType : (n : number, s : string) => void;
    setArgDescription : (n : number, s : string) => void;
    deleteArg : (n : number) => void;
}

const ToolArguments : React.FC<ToolArgumentsProps> = ({
    tool, setArgName, setArgType, setArgDescription, deleteArg,
}) => {

    return (

        <>

            {
                tool.arguments.map(
                    (arg : Argument, ix : number) => (

                        <ToolArgument
                            key={ix}
                            arg={arg}
                            ix={ix}
                            setArgName={setArgName}
                            setArgType={setArgType}
                            setArgDescription={setArgDescription}
                            deleteArg={deleteArg}
                        />
                    )
                )
            }

        </>
    );

}

export default ToolArguments;

