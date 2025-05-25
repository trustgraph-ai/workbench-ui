
import { Table, Code } from "@chakra-ui/react";

const PromptsTable = ({
  prompts, onSelect
}) => {

  return (
    <>
          <Table.Root
            sx={{ minWidth: 450 }}
            aria-label="table of entities"
            interactive
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Prompt</Table.ColumnHeader>
                <Table.ColumnHeader>Response</Table.ColumnHeader>
                <Table.ColumnHeader>Schema?</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {prompts.map((row, ix) => (
                <Table.Row key={ix} onClick={() => onSelect(row)}>
                  <Table.Cell component="th" scope="row" verticalAlign="top">
                    <Code p={2}>{row[0]}</Code>
                  </Table.Cell>
                  <Table.Cell verticalAlign="top">
                    <Code p={2}>{row[1] ? row[1].prompt : ""}</Code>
                  </Table.Cell>
                  <Table.Cell verticalAlign="top">
                    {row[1]
                      ? row[1]["response-type"] == "json"
                        ? "JSON"
                        : "text"
                      : "text"}
                  </Table.Cell>
                  <Table.Cell verticalAlign="top">
                    {row[1] ? (row[1].schema ? "yes" : "no") : ""}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
    </>
  );
};

export default PromptsTable;
