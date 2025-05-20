
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import ProcessingTable from '../components/processing/ProcessingTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Processing"
              description="TBD - this needed?"
            />
            <ProcessingTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

