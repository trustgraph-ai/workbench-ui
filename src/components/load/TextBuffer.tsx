
import React from 'react';

import { Upload } from 'lucide-react';

import { Box, Button } from '@chakra-ui/react';

import { useLoadStateStore } from '../../state/LoadState';
import TextAreaField from '../common/TextAreaField';

interface TextBufferProps {
    submit : () => void;
}

const TextBuffer : React.FC<TextBufferProps> = ({
    submit,
}) => {

  const value = useLoadStateStore((state) => state.text);
  const setValue = useLoadStateStore((state) => state.setText);
  const textUploads = useLoadStateStore((state) => state.textUploads);

  return (

    <>

      <Box mt={5}>

        <Button
          variant="solid"
          colorPalette="brand"
          disabled={value.length < 1}
          onClick={submit}
        >
          <Upload /> Load
        </Button>

      </Box>

      <Box mt={5}>

        {
          (textUploads > 0) &&
          <Box sx={{ml: 1, mt: 1, mb: 2}}>
            <Alert severity="success">
              {textUploads} text uploads
            </Alert>
          </Box>
        }

        <TextAreaField
          value={value}
          onValueChange={(e) => setValue(e)}
          label="Text content"
          rows={15}
        />

      </Box>

    </>

  );

}

export default TextBuffer;

