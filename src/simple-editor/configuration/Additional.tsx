
import { Typography, Box } from '@mui/material';

import Options from '../options/Options';

const Additional = ({
}) => {

    return (<>

        <Box sx={{ mb: 2}}>
        <Typography variant="h5" component="h2" gutterBottom>
            Optional Customization
        </Typography>

        <Typography variant="body2">
            Below are modules which can be customized for your specific use
            case. Select a module to open a tab with module customization
            instructions. For any module not selected, the TrustGraph deployment
            will be built with the standard module configuration.
        </Typography>
        </Box>

        <Options/>

    </>);
};

export default Additional;

