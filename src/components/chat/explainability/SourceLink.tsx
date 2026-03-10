import { Link, Text } from "@chakra-ui/react";
import { FileText } from "lucide-react";
import type { ProvenanceChainItem } from "@trustgraph/react-state";

interface SourceLinkProps {
  source: ProvenanceChainItem;
  onClick?: (source: ProvenanceChainItem) => void;
}

const SourceLink = ({ source, onClick }: SourceLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(source);
  };

  return (
    <Link
      fontSize="xs"
      color="primary.fg"
      display="inline-flex"
      alignItems="center"
      gap={1}
      onClick={handleClick}
      cursor="pointer"
      _hover={{ textDecoration: "underline" }}
    >
      <FileText size={12} />
      <Text as="span">{source.label || "Source document"}</Text>
    </Link>
  );
};

export default SourceLink;
