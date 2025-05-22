import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { Table, Tag, Checkbox } from "@chakra-ui/react";

import { Row } from "../state/row";
import { toaster } from "../ui/toaster";

import Actions from "./Actions";
import SubmitDialog from "./SubmitDialog";

import { useSocket } from "../../api/trustgraph/socket";
import { timeString } from "../../utils/time-string.ts";

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

  const onSubmitConfirm = (flow, tags) => {
    setSubmitOpen(false);

    const ids = Array.from(selected);

    submitOne(ids, flow, tags)
      .then(() => {
        console.log("Success");
        setSelected(() => new Set([]));
        toaster.create({
          title: "Documents submitted",
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

  const submitOne = (ids, flow, tags) => {
    // Shouldn't happen, make it a no-op.
    if (ids.length == 0) return;

    console.log("Submitting", ids[0]);

    const proc_id = uuidv4();

    let title = view
      .filter((row) => row.id == ids[0])
      .map((row) => row.title)
      .join(",");

    if (!title) title = "<no title>";

    const prom = socket
      .addLibraryProcessing(proc_id, ids[0], flow, null, null, tags)
      .then(() => {
        toaster.create({
          title: "Submitted " + title,
          type: "info",
        });
      });

    if (ids.length < 2) {
      return prom;
    } else {
      return prom.then(() => submitOne(ids.slice(1), flow, tags));
    }
  };

  const onEdit = () => {
        toaster.create({
          title: "Not implemented",
          type: "info",
        });
  };

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
        onSubmit={onSubmitConfirm}
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
