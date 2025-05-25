import { Table, Checkbox } from "@chakra-ui/react";

const KnowledgeCoresTable = ({
  cores, selected, toggle
}) => {
  return (
    <>
      <Table.Root interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cores.map((row) => (
            <Table.Row key={row.id} onClick={() => toggle(row.id)}>
              <Table.Cell>
                <Checkbox.Root
                  size="lg"
                  variant="solid"
                  checked={selected.has(row.id)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.Cell>
              <Table.Cell component="th" scope="row">
                {row.id}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default KnowledgeCoresTable;
