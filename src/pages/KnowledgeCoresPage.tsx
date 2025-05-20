
import React from 'react';
import { BrainCircuit } from 'lucide-react';

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
              icon={ <BrainCircuit /> }
              title="Knowledge Cores"
              description="Knowledge cores are modules which encapsulate a set of domain knowledge"
            />
            <KnowledgeCoresTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

