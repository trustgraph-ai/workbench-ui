
import React from 'react';
import { Hammer } from 'lucide-react';

import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';

const ToolsPage = () => {

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

export default ToolsPage;

