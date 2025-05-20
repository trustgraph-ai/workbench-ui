
import React, { useState } from 'react';

import GraphHelp from './Help';

const Help : React.FC <{}> = ({}) => {

    const [help, setHelp] = useState<boolean>(false);

    return (
      <GraphHelp />'
    );

}

export default Help;

