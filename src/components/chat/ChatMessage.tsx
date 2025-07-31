import { Box, Flex, Text, Avatar, Badge } from "@chakra-ui/react";
import { Brain, Eye, CheckCircle } from "lucide-react";
import Markdown from 'react-markdown-it';

const ChatMessage = ({ message }) => {
  const isUser = message.role === "human";
  const messageType = message.type || "normal";

  // Define styles and icons for different message types
  const getTypeStyles = () => {
    switch (messageType) {
      case "thinking":
        return {
          bg: "yellowBrand.contrast",
          borderColor: "yellowBrand.muted",
          borderWidth: "1px",
          icon: <Brain size={14} />,
          badge: "Thinking",
          badgeColor: "yellowBrand",
          color: "yellowBrand.fg",
        };
      case "observation":
        return {
          bg: "warmBrand.contrast",
          borderColor: "warmBrand.muted",
          borderWidth: "1px",
          icon: <Eye size={14} />,
          badge: "Observation",
          badgeColor: "warmBrand",
          color: "warmBrand.fg",
        };
      case "answer":
        return {
          bg: "insightfulBrand.contrast",
          borderColor: "insightfulBrand.muted",
          borderWidth: "1px",
          icon: <CheckCircle size={14} />,
          badge: "Answer",
          badgeColor: "insightfulBrand",
          color: "insightfulBrand.fg",
        };
      default:
        return {
          bg: isUser ? "brand.solid" : "bg",
          color: isUser ? "fg.inverted" : "fg",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Flex w="100%" justify={isUser ? "flex-end" : "flex-start"} mb={2}>
      {!isUser && (
        <Avatar.Root size="sm" colorPalette="altBrand" mr={3}>
          <Avatar.Fallback name="Bot" />
        </Avatar.Root>
      )}

      <Box
        maxW="70%"
        bg={typeStyles.bg}
        color={typeStyles.color || (isUser ? "fg.inverted" : "fg")}
        borderRadius="lg"
        borderColor={typeStyles.borderColor}
        borderWidth={typeStyles.borderWidth}
        px={4}
        py={2}
      >
        {typeStyles.badge && (
          <Flex align="center" mb={2}>
            {typeStyles.icon}
            <Badge 
              ml={2} 
              size="sm" 
              colorPalette={typeStyles.badgeColor}
              variant="subtle"
            >
              {typeStyles.badge}
            </Badge>
          </Flex>
        )}
        <Markdown>{message.text}</Markdown>
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
