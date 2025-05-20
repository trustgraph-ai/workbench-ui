
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../api/trustgraph/socket';

import { Table, Link, Code } from '@chakra-ui/react';

const DocumentTable = () => {

  const socket = useSocket();

  const [ systemPrompt, setSystemPrompt ] = useState<string>("");
  const [ prompts, setPrompts ] = useState([]);

// FIXME:
console.log(systemPrompt);



  useEffect(
    () => {

      socket.getConfig([
        { type: "prompt", key: "system" },
        { type: "prompt", key: "template-index" }
      ]).then(
        (res) => {
          setSystemPrompt(JSON.parse(res.values[0].value));

          console.log("System:", res.values[0].value);
          
          const promptIds = JSON.parse(res.values[1].value);

          return socket.getConfig(
            promptIds.map(
              (id) => {
                return {
                  type: "prompt",
                  key: "template." + id,
                };
              }
            )
          ).then((r) => { return { prompts: promptIds, config: r.values } } );
        }
      ).then(
        (p) => {
          return {
            prompts: p.prompts,
            config: p.config.map((c) => JSON.parse(c.value)),
          };
        }
      ).then(
        (p) => {
          const promptIds = p.prompts;
          const config = p.config.map(
            (c, ix) => [promptIds[ix], c]
          );
          return config;
        }
      ).then(
        (config) => setPrompts(config)
      );

/*
        socket.putConfig([
          {type: "test", key: "test1", value: "asd123"},
          {type: "test", key: "test2", value: "value456"},
        ]).then(x => 
          setValue(JSON.stringify(x, null, 4))
          )

        socket.getConfig([
          {type: "test", key: "test1"},
          {type: "test", key: "test2"},
        ]).then(x => 
          setValue(JSON.stringify(x, null, 4))
          )

*/
/*      socket.getPrompt("extract-definitions").then(
        (x) => {
          console.log(x);
          setValue(JSON.stringify(x, null, 4));
        }
      )*/
    },
    [socket]
  );
    
    return (

          <Table.Root sx={{ minWidth: 450 }}
              aria-label="table of entities"
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
                {
                    prompts.map((row : Row) => (
                        <Table.Row
                          key={row.id}
                          sx={{
                              '&:last-child td': { border: 0 },
                              '&:last-child th': { border: 0 }
                          }}
                        >
                            <Table.Cell component="th" scope="row"
                              verticalAlign="top"
                            >
                              <Link
                                  align="left"
                                  component="button"
                                  onClick={
                                      () => select(row)
                                  }
                              >
                                <Code>{row[0]}</Code>
                              </Link>
                            </Table.Cell>
                            <Table.Cell verticalAlign="top"
                            >
                                <Code>{row[1].prompt}</Code>
                            </Table.Cell>
                            <Table.Cell verticalAlign="top"
                            >
                                {row[1]["response-type"] == 'json' ?
                                  'JSON' : 'text'
                                }
                            </Table.Cell>
                            <Table.Cell verticalAlign="top"
                            >
                                {(row[1].schema) ? 'yes' : 'no' }
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
          </Table.Root>
    );                    
}

export default DocumentTable;

