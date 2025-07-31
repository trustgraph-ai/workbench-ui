import { createColumnHelper } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

/**
 * Node relationship data structure for the relationships table
 * Represents a single relationship with direction and label
 */
export type NodeRelationship = {
  relationship: string; // Human-readable relationship name (label)
  direction: "incoming" | "outgoing"; // Direction of the relationship
  uri?: string; // Original relationship URI (optional, for reference)
};

// Create a column helper instance for type-safe column definitions
export const columnHelper = createColumnHelper<NodeRelationship>();

/**
 * Column definitions for the node relationships table
 * Defines how each column should be rendered and what data it displays
 */
export const columns = [
  // Relationship column - displays the relationship with directional arrow
  columnHelper.accessor("relationship", {
    header: "Relationship",
    cell: (info) => {
      const direction = info.row.original.direction;
      const relationship = info.getValue();
      
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {direction === "incoming" && <ChevronRight size={16} />}
          <span>{relationship}</span>
          {direction === "outgoing" && <ChevronRight size={16} />}
        </div>
      );
    },
  }),
];