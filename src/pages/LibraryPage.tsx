
import React from 'react';
import { LibraryBig } from 'lucide-react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import DocumentTable from '../components/library/DocumentTable';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              icon={ <LibraryBig /> }
              title="Library"
              description="Managing loaded documents"
            />
            <DocumentTable />
            <CenterSpinner />
        </>

    );

}

export default Load;

