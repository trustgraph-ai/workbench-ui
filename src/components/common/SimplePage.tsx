
import React, { useState, useEffect, PropsWithChildren } from 'react';

import {
  Box, Button, Container, Separator, Flex, Field, Heading, Input, Stack,
  Text, Link,
} from "@chakra-ui/react"

import ColorModeToggle from '../components/color-mode-toggle';
import UnauthedHeader from './UnauthedHeader';

const SimplePage : React.FC<PropsWithChildren<{
  title : string
}>> = ({
  title, children
}) => {
  return (
  <>
    <UnauthedHeader />
    <Flex minH="100vh" align="center" justify="center" bg="brand.900">
      <Container maxW="md" py={12}>
        <Box bg="brand.800" p={8} borderRadius="md" boxShadow="lg" borderWidth="1px" borderColor="brand.muted">
          <Stack spacing={6}>
            <Heading as="h1" fontSize="2xl" textAlign="center" color="brand.400" mb={2}>
              {title}
            </Heading>

            {children}

          </Stack>
        </Box>
      </Container>
    </Flex>
    </>
  )
};

export default SimplePage;
