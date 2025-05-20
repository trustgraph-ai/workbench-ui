
import React, { useState, useEffect, PropsWithChildren } from 'react';

import {
  Box, SimpleGrid, Flex, Button, Drawer, Portal, CloseButton, Text,
  Table, Link, Code,
} from '@chakra-ui/react';

const ExternalDocs : React.FC<PropsWithChildren<{
  href : string;
}>> = ({
  href, children
}) => {
  return (
    <Link href={href} target="_blank" colorPalette="altBrand">
      {children}
    </Link>
  );
}

export default ExternalDocs;
