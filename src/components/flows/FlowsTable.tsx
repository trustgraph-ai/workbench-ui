import { Table, Checkbox } from "@chakra-ui/react";

const FlowsTable = ({ flows, selected, toggle }) => {
  return (
    <>
      <Table.Root interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Class name</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {flows.map((row: Row) => (
            <Table.Row onClick={() => toggle(row[0])} key={row[0]}>
              <Table.Cell>
                <Checkbox.Root
                  size="lg"
                  variant="solid"
                  checked={selected.has(row[0])}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.Cell>
              <Table.Cell>{row[0]}</Table.Cell>
              <Table.Cell>{row[1]["class-name"]}</Table.Cell>
              <Table.Cell>{row[1].description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default FlowsTable;
