
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import KnowledgeCoresTable from '../components/kc/KnowledgeCoresTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Knowledge Cores"
              description="TBD"
            />
            <KnowledgeCoresTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

