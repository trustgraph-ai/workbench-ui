
import React from 'react';

import { SendHorizontal } from 'lucide-react';

import { Box, Button } from '@chakra-ui/react';

interface ProgressSubmitButtonProps {
    disabled : boolean;
    working : boolean;
};

const ProgressSubmitButton : React.FC <ProgressSubmitButtonProps> = ({
    disabled, working,
}) => {

    return (

        <Box>
          <Button variant="subtle" disabled={disabled}
            loading={working} color="brand"
          >
            Send <SendHorizontal />
          </Button>
        </Box>

    );

}

export default ProgressSubmitButton;

