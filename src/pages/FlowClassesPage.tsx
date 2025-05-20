
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';
import { ScrollText } from 'lucide-react';

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
              icon={ <ScrollText /> }
              title="Flow Classes"
              description="Managing the dataflow definitions"
            />
            <FlowClassesTable />
            <CenterSpinner />
        </>

    );

}

export default Load;

