
import { Typography, Box } from '@mui/material';

import Deployment from '../deployment/Deployment';

const GenerateDeployment = ({
}) => {

    return (<>

        <Box className="deployment">

            <Typography variant="h5" component="h2" gutterBottom>
              Deployment Process
            </Typography>

            <Deployment/>

        </Box>

    </>);
};

export default GenerateDeployment;

