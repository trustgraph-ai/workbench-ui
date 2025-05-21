import React, { useEffect, useState } from "react";

import { Check } from 'lucide-react';

import {
  Table, Link, Tag, Checkbox, ActionBar, Portal, Button
} from "@chakra-ui/react";

import { Row } from "../state/row";

import { useSocket } from "../../api/trustgraph/socket";

const DocumentTable = () => {
  const [view, setView] = useState([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const socket = useSocket();

  useEffect(() => {
    socket
      .getLibraryDocuments()
      .then((x) => setView(x))
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  const toggle = (id) => {
    let newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelected(newSet);
  }

  return (
    <>
    <ActionBar.Root open={selected.size > 0} colorPalette="blue">
        <Portal>
          <ActionBar.Positioner >
            <ActionBar.Content
              background="{colors.bg.muted}" color="fg"
              colorPalette="brand"
            >
              <ActionBar.SelectionTrigger>
                <Check /> {selected.size} selected
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Button variant="outline" size="sm">
                Submit
              </Button>
              <Button variant="outline" colorPalette="red" size="sm">
                Delete
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
    </ActionBar.Root>
    <Table.Root>
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
        {view.map((row: Row) => (
          <Table.Row key={row.id}>
            <Table.Cell>
              <Checkbox.Root size="lg"
                variant="solid"
                checked={selected.has(row.id)}
                onCheckedChange={(e) => toggle(row.id)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Table.Cell>
            <Table.Cell>
              <Link onClick={() => select(row)}>{row.title}</Link>
            </Table.Cell>
            <Table.Cell>{row.time}</Table.Cell>
            <Table.Cell>{row.comments}</Table.Cell>
            <Table.Cell>
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
