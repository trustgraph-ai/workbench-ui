
import React from 'react';
import { CircleArrowRight } from 'lucide-react';

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
              icon={ <CircleArrowRight /> }
              title="Processing"
              description="Submit documents for processing"
            />
            <ProcessingTable />
            <CenterSpinner/>
        </>

    );

}

export default Load;

