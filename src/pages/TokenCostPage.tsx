
import React from 'react';
import { HandCoins } from 'lucide-react';

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
              icon={ <HandCoins /> }
              title="Token Cost Configuration"
              description="Define the cost of AI token processing"
            />
            <TokenCostTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

