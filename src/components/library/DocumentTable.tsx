import React, { useEffect, useState } from "react";

import { Check } from "lucide-react";

import {
  Table,
  Link,
  Tag,
  List,
  Checkbox,
  ActionBar,
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
} from "@chakra-ui/react";

import { Row } from "../state/row";
import { toaster } from "../ui/toaster";

import SelectField from "../common/SelectField";

import { useSocket } from "../../api/trustgraph/socket";

const DocumentTable = () => {
  const [view, setView] = useState([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

const [submitOpen, setSubmitOpen] = useState(false);


  const [flows, setFlows] = useState([]);


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
      })
  }, [socket]);

  useEffect(() => {
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        )
        })
      .then((x) => setFlows(x))
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  const toggle = (id) => {
    let newSet = new Set(selected);
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

const [flow, setFlow] = useState("");

  return (
    <>
      <ActionBar.Root open={selected.size > 0} colorPalette="blue">
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content
              background="{colors.bg.muted}"
              color="fg"
              colorPalette="brand"
            >
              <ActionBar.SelectionTrigger>
                <Check /> {selected.size} selected
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Button variant="outline" size="sm" onClick={onSubmit}>
                Submit
              </Button>
              {selected.size == 1 && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                colorPalette="red"
                size="sm"
                onClick={onDelete}
              >
                Delete
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>



          <Dialog.Root
            placement="center"
            open={submitOpen}
            onOpenChange={(x) => { console.log(x); setSubmitOpen(x.open)}}

          >
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Dialog Title</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <p>
                    Submit the following documents:
                    </p>
                    <List.Root>
                      {view.filter((x) => selected.has(x.id)).map(
                      (row) => (
                        <List.Item key={row.id} ml="1.5rem">
                        {row.title ? row.title : "<untitled>"}
                        </List.Item>
                      )
                      )}
                    </List.Root>
<p>
With following flows:
</p>

<List.Root>

{flows.map(
  (flow) => <List.Item key={flow[0]}>{flow[0]}</List.Item>
  )
}
</List.Root>

<Box>

<SelectField

label="bunches"

items={
flows.map( (flow) => { return {
value: flow[0],
description: flow[1].description
}
}
)}


value={flow}
onValueChange={ (x) => {setFlow(x)} }

/>

</Box>


                  </Dialog.Body>
                  <Dialog.Footer>
                      <Button variant="outline"
                      onClick={() => setSubmitOpen(false)}
                      >
                      Cancel
                      </Button>
                    <Button onClick={() => setSubmitOpen(false)}>
                    Submit
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>





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
