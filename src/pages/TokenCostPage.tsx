
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import TokenCostTable from '../components/token-cost/TokenCostTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Token Cost Configuration"
              description="TBD"
            />
            <TokenCostTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

