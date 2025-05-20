
import React from 'react';

import { useSocket } from '../api/trustgraph/socket';

import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    return (
        <>
            <PageHeader
              title="Agent Tools Configuration"
              description="TBD"
            />
            <CenterSpinner/>
        </>

    );

}

export default Load;

