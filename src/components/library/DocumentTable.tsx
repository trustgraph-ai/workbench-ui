
import { Table, Tag, Checkbox } from "@chakra-ui/react";

import { timeString } from "../../utils/time-string.ts";

const DocumentTable = ({ selected, documents, toggle }) => {
  return (
    <>
      <Table.Root interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Time</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>Tags</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {documents.map((row) => (
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
              <Table.Cell onClick={() => toggle(row.id)}>
                {row.title}
              </Table.Cell>
              <Table.Cell onClick={() => toggle(row.id)}>
                {timeString(row.time)}
              </Table.Cell>
              <Table.Cell onClick={() => toggle(row.id)}>
                {row.comments}
              </Table.Cell>
              <Table.Cell onClick={() => toggle(row.id)}>
                {row.tags.map((t) => (
                  <Tag.Root key={t} mr={2}>
                    <Tag.Label>{t}</Tag.Label>
                  </Tag.Root>
                ))}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default DocumentTable;
