
import React from 'react';
import { Hammer } from 'lucide-react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              icon={ <Hammer /> }
              title="Agent Tools Configuration"
              description="Agent tools equip the agent framework to work with your data"
            />
            <CenterSpinner/>
        </>

    );

}

export default Load;

