
import React from 'react';

import { Box } from '@chakra-ui/react';

import { useLoadStateStore } from '../../state/LoadState';
import ChipInputField from '../common/ChipInputField';

interface KeywordsProps {}

const Keywords : React.FC<KeywordsProps> = ({
}) => {

  const values = useLoadStateStore((state) => state.keywords);
  const setValues = useLoadStateStore((state) => state.setKeywords);


  return (
    <ChipInputField
      label="Keywords"
      required={false}
      values={values}
      onValuesChange={setValues}
    />

  );

}

export default Keywords;


