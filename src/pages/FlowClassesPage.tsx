
import React from 'react';

import { ScrollText } from 'lucide-react';

import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import FlowClassesTable from '../components/flow-classes/FlowClassesTable';

const FlowClassesPage = () => {

    return (
        <>
            <PageHeader
              icon={ <ScrollText /> }
              title="Flow Classes"
              description="Managing the dataflow definitions"
            />
            <FlowClassesTable />
            <CenterSpinner />
        </>

    );

}

export default FlowClassesPage;

