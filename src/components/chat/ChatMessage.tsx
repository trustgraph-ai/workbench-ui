import { useState } from "react";
import { Box, Flex, Avatar, Badge, IconButton } from "@chakra-ui/react";
import { Brain, Eye, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import Markdown from "react-markdown-it";

// Smart truncation: first sentence if short, otherwise ~100 chars at word boundary
// Always adds ellipsis to make it clear there's more content
const truncateText = (text: string, maxLength: number = 80): string => {
  if (!text) return '';

  // Try to find first sentence (ends with . ! or ?)
  const firstSentence = text.match(/^[^.!?]+[.!?]/);
  if (firstSentence && firstSentence[0].length <= maxLength) {
    return firstSentence[0].trimEnd() + '...';
  }

  // Otherwise truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated).trimEnd() + '...';
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === "human";
  const messageType = message.type || "normal";

  // Collapsible state for thinking and observation messages
  const isCollapsible = messageType === "thinking" || messageType === "observation";
  const [isExpanded, setIsExpanded] = useState(false);

  // Define styles and icons for different message types
  const getTypeStyles = () => {
    switch (messageType) {
      case "thinking":
        return {
          bg: "thinking.contrast",
          borderColor: "thinking.muted",
          borderWidth: "1px",
          icon: <Brain size={14} />,
          badge: "Thinking",
          badgeColor: "thinking",
          color: "collout1.fg",
        };
      case "observation":
        return {
          bg: "observing.contrast",
          borderColor: "observing.muted",
          borderWidth: "1px",
          icon: <Eye size={14} />,
          badge: "Observation",
          badgeColor: "observing",
          color: "observing.fg",
        };
      case "answer":
        return {
          bg: "insightful.contrast",
          borderColor: "insightful.muted",
          borderWidth: "1px",
          icon: <CheckCircle size={14} />,
          badge: "Answer",
          badgeColor: "insightful",
          color: "insightful.fg",
        };
      default:
        return {
          bg: isUser ? "primary.solid" : "bg",
          color: isUser ? "fg.inverted" : "fg",
        };
    }
  };

  const typeStyles = getTypeStyles();

  // Determine what text to display
  const displayText = isCollapsible && !isExpanded
    ? truncateText(message.text)
    : message.text;

  return (
    <Flex w="100%" justify={isUser ? "flex-end" : "flex-start"} mb={2}>
      {!isUser && (
        <Avatar.Root size="sm" colorPalette="accent" mr={3}>
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
        {typeStyles.badge && isCollapsible && !isExpanded ? (
          // Compact collapsed view - everything on one line
          <Flex align="center" gap={2} cursor="pointer" onClick={() => setIsExpanded(true)}>
            <IconButton
              aria-label="Expand"
              size="xs"
              variant="ghost"
            >
              <ChevronRight size={16} />
            </IconButton>
            {typeStyles.icon}
            <Badge
              size="sm"
              colorPalette={typeStyles.badgeColor}
              variant="subtle"
            >
              {typeStyles.badge}
            </Badge>
            <Box fontSize="sm" opacity={0.9}>
              {displayText}
            </Box>
          </Flex>
        ) : typeStyles.badge ? (
          // Expanded view with header and full content
          <>
            <Flex align="center" mb={2} justify="space-between">
              <Flex align="center">
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
              {isCollapsible && (
                <IconButton
                  aria-label="Collapse"
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronDown size={16} />
                </IconButton>
              )}
            </Flex>
            <Markdown>{displayText}</Markdown>
          </>
        ) : (
          // Normal message without badge
          <Markdown>{displayText}</Markdown>
        )}
      </Box>

      {isUser && (
        <Avatar.Root size="sm" colorPalette="primary" ml={3}>
          <Avatar.Fallback name="User" />
        </Avatar.Root>
      )}
    </Flex>
  );
};

export default ChatMessage;
