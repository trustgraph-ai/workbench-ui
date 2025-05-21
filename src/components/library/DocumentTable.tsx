import React, { useEffect, useState } from "react";

import { Table, Link, Tag, Checkbox } from "@chakra-ui/react";

import { Row } from "../state/row";
import { toaster } from "../ui/toaster";

import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";

import { useSocket } from "../../api/trustgraph/socket";

const DocumentTable = () => {
  const [view, setView] = useState([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [submitOpen, setSubmitOpen] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    socket
      .getLibraryDocuments()
      .then((x) => setView(x))
      .catch((err) => {
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  }, [socket]);

  const toggle = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const onSubmit = () => {
    setSubmitOpen(true);
  };

  const onEdit = () => {};

  const onDelete = () => {
    const ids = Array.from(selected);

    deleteOne(ids)
      .then(() => {
        console.log("Success");
        toaster.create({
          title: "Documents deleted",
          type: "success",
        });
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
  };

  const deleteOne = (ids) => {
    // Shouldn't happen, make it a no-op.
    if (ids.length == 0) return;

    console.log("Deleting", ids[0]);
    const prom = socket.removeLibraryDocument(ids[0]).then(() => {
      setView((x) => x.filter((row) => row.id != ids[0]));
      setSelected((x) => {
        const newSet = new Set(x);
        x.delete(ids[0]);
        return newSet;
      });
    });

    if (ids.length < 2) {
      return prom;
    } else {
      return prom.then(() => deleteOne(ids.slice(1)));
    }
  };

  return (
    <>
      <Actions
        selectedCount={selected.size}
        onSubmit={onSubmit}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        docs={view.filter((x) => selected.has(x.id))}
      />

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
          {view.map((row: Row) => (
            <Table.Row key={row.id}>
              <Table.Cell>
                <Checkbox.Root
                  size="lg"
                  variant="solid"
                  checked={selected.has(row.id)}
                  onCheckedChange={() => toggle(row.id)}
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
