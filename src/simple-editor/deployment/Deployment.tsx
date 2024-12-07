
import React from 'react';

import { Box } from '@mui/material';

//import { useModelParamsStore } from '../state/ModelParams';

import DeploymentPlatform from './DeploymentPlatform';
import DeploymentModel from './DeploymentModel';
import DeploymentConfig from './DeploymentConfig';
import DeploymentInstructions from './DeploymentInstructions';
import DeploymentVectorStore from './DeploymentVectorStore';

interface DeploymentProps {
}

const Deployment: React.FC<DeploymentProps> = ({
}) => {

  return (

      <>

          <Box className="deployment">

              <Box>
                  <DeploymentPlatform/>
              </Box>

              <Box>
                  <DeploymentModel/>
              </Box>

              <Box>
                  <DeploymentVectorStore/>
              </Box>

              <Box>
                  <DeploymentConfig/>
              </Box>

              <Box>
                  <DeploymentInstructions/>
              </Box>

          </Box>

      </>

  );
};

export default Deployment;

