import { Box, Flex, Text, Avatar } from "@chakra-ui/react";
import Markdown from 'react-markdown-it';

const ChatMessage = ({ message }) => {
  const isUser = message.role === "human";

  return (
    <Flex w="100%" justify={isUser ? "flex-end" : "flex-start"} mb={2}>
      {!isUser && (
        <Avatar.Root size="sm" colorPalette="altBrand" mr={3}>
          <Avatar.Fallback name="Bot" />
        </Avatar.Root>
      )}

      <Box
        maxW="70%"
        bg={isUser ? "brand.solid" : "bg"}
        color={isUser ? "fg.inverted" : "fg"}
        borderRadius="lg"
        px={4}
        py={2}
      >
        <Markdown>
          {message.text}
        </Markdown>
      </Box>

      {isUser && (
        <Avatar.Root size="sm" colorPalette="brand" ml={3}>
          <Avatar.Fallback name="User" />
        </Avatar.Root>
      )}
    </Flex>
  );
};

export default ChatMessage;
