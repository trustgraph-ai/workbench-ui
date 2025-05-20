
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import FlowTable from '../components/flows/FlowTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Processing Flows"
              description="Managing the processing configurations"
            />
            <FlowTable/>
            <CenterSpinner/>
        </>
    );

}

export default Load;

