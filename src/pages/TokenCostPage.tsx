
import React from 'react';
import { HandCoins } from 'lucide-react';

import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import TokenCostTable from '../components/token-cost/TokenCostTable';

const TokenCostPage = () => {

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

export default TokenCostPage;

