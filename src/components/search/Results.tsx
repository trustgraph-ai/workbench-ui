import React from "react";
import { useNavigate } from "react-router";

// Chakra UI components for displaying data in a table format
import { Table, Link } from "@chakra-ui/react";

// State management hooks and utilities
import { useWorkbenchStateStore } from "../../state/workbench";
import { useSearchStateStore } from "../../state/search";
import { Row } from "../../utils/row";

/**
 * Results component displays search results in a table format
 * Shows entity name, description, and similarity score for each result
 * Allows navigation to individual entity detail pages
 */
const Results = () => {
  // Get search results from search state
  const view = useSearchStateStore((state) => state.rows);

  // Get function to set selected entity in workbench
  const setSelected = useWorkbenchStateStore((state) => state.setSelected);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handles entity selection by setting the selected entity in state
   * and navigating to the entity detail page
   */
  const select = (row: Row) => {
    // Set selected entity with URI and label (fallback to 'n/a' if no label)
    setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
    // Navigate to entity detail page
    navigate("/entity");
  };

  return (
    <Table.Root size="sm" mt={6} striped>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Entity</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
          <Table.ColumnHeader>Similarity</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {/* Render each search result as a table row */}
        {view.map((row: Row) => (
          <Table.Row key={row.uri}>
            <Table.Cell component="th" scope="row" verticalAlign="top">
              {/* Clickable entity name that navigates to detail page */}
              <Link colorPalette="brand" onClick={() => select(row)}>
                {row.label}
              </Link>
            </Table.Cell>
            <Table.Cell verticalAlign="top">{row.description}</Table.Cell>
            <Table.Cell verticalAlign="top">
              {/* Display similarity score rounded to 2 decimal places */}
              {row.similarity!.toFixed(2)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default Results;
