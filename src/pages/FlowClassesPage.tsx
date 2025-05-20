
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import FlowClassesTable from '../components/flow-classes/FlowClassesTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Flow Classes"
              description="TBD"
            />
            <FlowClassesTable />
            <CenterSpinner />
        </>

    );

}

export default Load;

