import { Box, Text } from "@chakra-ui/react";
import type { QuestionEvent } from "@trustgraph/react-state";

interface QuestionSectionProps {
  question: QuestionEvent;
}

const QuestionSection = ({ question }: QuestionSectionProps) => {
  if (!question.query) return null;

  return (
    <Box mb={3}>
      <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb={1}>
        Query
      </Text>
      <Text fontSize="sm" fontStyle="italic">
        "{question.query}"
      </Text>
    </Box>
  );
};

export default QuestionSection;
