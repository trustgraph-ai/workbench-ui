
import { Typography } from '@mui/material';

import ParamsForm from '../model-params/ParamsForm';
import { useModelParamsStore } from '../state/ModelParams';

const Parameters = ({
}) => {

    const version
        = useModelParamsStore((state) => state.trustgraphVersion);

    return (<>

        <Typography variant="h5" component="h2" gutterBottom>
          TrustGraph Component Options
        </Typography>

        <Typography variant="body1" component="p" gutterBottom>
            Release version: <code>{version}</code>
        </Typography>

        <Typography variant="body1" component="p" gutterBottom>
            For each category, select one option from the list of
            available components.
            </Typography>

        <ParamsForm/>

    </>);
};

export default Parameters;

