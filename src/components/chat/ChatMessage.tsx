import { Box, Flex, Text, Avatar, Badge } from "@chakra-ui/react";
import { Brain, Eye, CheckCircle } from "lucide-react";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "human";
  const messageType = message.type || "normal";

  // Define styles and icons for different message types
  const getTypeStyles = () => {
    switch (messageType) {
      case "thinking":
        return {
          bg: "blue.50",
          borderColor: "blue.200",
          borderWidth: "1px",
          icon: <Brain size={14} />,
          badge: "Thinking",
          badgeColor: "blue",
        };
      case "observation":
        return {
          bg: "orange.50",
          borderColor: "orange.200",
          borderWidth: "1px",
          icon: <Eye size={14} />,
          badge: "Observation",
          badgeColor: "orange",
        };
      case "answer":
        return {
          bg: "green.50",
          borderColor: "green.200",
          borderWidth: "1px",
          icon: <CheckCircle size={14} />,
          badge: "Answer",
          badgeColor: "green",
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
        <Text>{message.text}</Text>
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
