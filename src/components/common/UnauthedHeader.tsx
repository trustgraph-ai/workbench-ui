
import {
  Box,
  Button,
  Container,
  Separator,
  Flex,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react"

import { FaGithub, FaGoogle, FaApple } from "react-icons/fa"

import ColorModeToggle from '../color-mode-toggle';

export function UnauthedHeader() {
  return (
  <>
    <Flex mb={2} alignItems="center" justifyContent="space-between"
      width="100%" px={4} py={2}
    >
      <Flex mb={2} alignItems="center">
      </Flex>
      <Box>
        <ColorModeToggle />
      </Box>
    </Flex>
    </>
  )
}

export default UnauthedHeader;

