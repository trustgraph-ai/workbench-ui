import { Table } from "@chakra-ui/react";

const ToolsTable = ({ setSelected, tools }) => {
  const onSelect = (row) => {
    setSelected(row[0]);
  };

  return (
    <>
      <Table.Root
        sx={{ minWidth: 450 }}
        aria-label="table of entities"
        interactive
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tool ID</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tools.map((row, ix) => (
            <Table.Row key={ix} onClick={() => onSelect(row)}>
              <Table.Cell component="th" scope="row" verticalAlign="top">
                {row[0]}
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1] ? row[1].description : ""}
              </Table.Cell>
              <Table.Cell verticalAlign="top">
                {row[1] ? row[1].type : ""}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default ToolsTable;
