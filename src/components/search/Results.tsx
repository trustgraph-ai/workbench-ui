import React from "react";
import { useNavigate } from "react-router";

import { Table, Link } from "@chakra-ui/react";

import { useWorkbenchStateStore } from "../../state/WorkbenchState";
import { useSearchStateStore } from "../../state/SearchState";
import { Row } from "../state/row";

const Results = () => {
  const view = useSearchStateStore((state) => state.rows);

  const setSelected = useWorkbenchStateStore((state) => state.setSelected);

  const navigate = useNavigate();

  const select = (row: Row) => {
    setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
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
        {view.map((row: Row) => (
          <Table.Row key={row.uri}>
            <Table.Cell component="th" scope="row" verticalAlign="top">
              <Link colorPalette="brand" onClick={() => select(row)}>
                {row.label}
              </Link>
            </Table.Cell>
            <Table.Cell verticalAlign="top">{row.description}</Table.Cell>
            <Table.Cell verticalAlign="top">
              {row.similarity!.toFixed(2)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default Results;
