import React, { useState, useMemo, useEffect, useRef } from "react";
import { VStack, HStack, Button, Text, Box, Textarea } from "@chakra-ui/react";
import { Search } from "lucide-react";
import {
  useRowEmbeddingsQuery,
  useSchemas,
  useEmbeddings,
} from "@trustgraph/react-state";
import TextField from "../common/TextField";
import NumberField from "../common/NumberField";
import SelectField from "../common/SelectField";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import BasicTable from "../common/BasicTable";

// Table row type for row embeddings query results
interface RowEmbeddingsResultRow {
  index_name: string;
  index_value: string;
  text: string;
  score: number;
}

const columnHelper = createColumnHelper<RowEmbeddingsResultRow>();

const columns = [
  columnHelper.accessor("index_name", {
    header: "Index Name",
    cell: (info) => <Text fontFamily="mono">{info.getValue()}</Text>,
  }),
  columnHelper.accessor("index_value", {
    header: "Index Value",
    cell: (info) => <Text>{info.getValue()}</Text>,
  }),
  columnHelper.accessor("text", {
    header: "Text",
    cell: (info) => (
      <Text fontSize="sm" maxW="400px" noOfLines={3}>
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: (info) => (
      <Text fontFamily="mono" color="blue.500">
        {info.getValue().toFixed(4)}
      </Text>
    ),
  }),
];

const RowEmbeddingsQueryTab: React.FC = () => {
  const [query, setQuery] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [indexName, setIndexName] = useState("");
  const [limit, setLimit] = useState(10);

  // searchTerm is set on submit to trigger embedding generation
  const [searchTerm, setSearchTerm] = useState("");

  const rowEmbeddingsQuery = useRowEmbeddingsQuery();
  const { schemas, schemasLoading } = useSchemas();

  // Get embeddings for the search term
  const {
    embeddings,
    isLoading: embeddingsLoading,
  } = useEmbeddings({ flow: undefined, term: searchTerm || undefined });

  // Track the search parameters at time of submit
  const searchParamsRef = useRef<{
    schemaName: string;
    indexName: string | undefined;
    limit: number;
  } | null>(null);

  // When embeddings arrive, execute the row embeddings query
  useEffect(() => {
    if (embeddings && embeddings.length > 0 && searchParamsRef.current) {
      const params = searchParamsRef.current;
      searchParamsRef.current = null;
      rowEmbeddingsQuery.executeQuery({
        vectors: embeddings[0],
        schemaName: params.schemaName,
        indexName: params.indexName,
        limit: params.limit,
      });
      setSearchTerm("");
    }
  }, [embeddings]);

  // Create schema options for dropdown
  const schemaItems = useMemo(() => {
    if (!schemas || schemas.length === 0) return [];
    return schemas.map(([id]: [string, unknown]) => ({
      value: id,
      label: id,
      description: id,
    }));
  }, [schemas]);

  const handleSubmit = () => {
    if (!query.trim() || !schemaName.trim()) return;

    searchParamsRef.current = {
      schemaName: schemaName.trim(),
      indexName: indexName.trim() || undefined,
      limit: limit,
    };
    setSearchTerm(query.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Transform matches for table display
  const tableData: RowEmbeddingsResultRow[] = useMemo(() => {
    return rowEmbeddingsQuery.matches.map((match) => ({
      index_name: match.index_name,
      index_value: match.index_value.join(", "),
      text: match.text,
      score: match.score,
    }));
  }, [rowEmbeddingsQuery.matches]);

  // Create the table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <VStack gap={6} align="stretch" p={6}>
      <VStack gap={4} align="stretch">
        <Text fontWeight="medium" fontSize="lg">
          Semantic Search on Structured Data
        </Text>
        <Text color="fg.muted" fontSize="sm">
          Search for records in structured data indexes using semantic similarity.
          Enter a query and select a schema to search within.
        </Text>

        <HStack gap={4} align="flex-end">
          <Box flex={1}>
            {schemaItems.length > 0 ? (
              <SelectField
                label="Schema"
                value={schemaName ? [schemaName] : []}
                onValueChange={(values) => setSchemaName(values[0] || "")}
                items={schemaItems}
              />
            ) : (
              <TextField
                label="Schema Name"
                value={schemaName}
                onValueChange={setSchemaName}
                placeholder="Enter schema name"
              />
            )}
          </Box>
          <Box flex={1}>
            <TextField
              label="Index Name (optional)"
              value={indexName}
              onValueChange={setIndexName}
              placeholder="Filter by specific index"
            />
          </Box>
          <Box w="150px">
            <NumberField
              label="Limit"
              value={limit}
              onValueChange={setLimit}
              minValue={1}
              maxValue={100}
            />
          </Box>
        </HStack>

        <TextField
          label="Search Query"
          value={query}
          onValueChange={setQuery}
          placeholder="e.g., Find products similar to 'wireless bluetooth headphones'"
          onKeyDown={handleKeyPress}
        />

        <HStack justify="flex-end">
          <Button
            onClick={handleSubmit}
            disabled={
              !query.trim() ||
              !schemaName.trim() ||
              rowEmbeddingsQuery.isExecuting ||
              embeddingsLoading ||
              !rowEmbeddingsQuery.isReady ||
              schemasLoading
            }
            colorPalette="primary"
          >
            <Search size={16} />
            Search
          </Button>
        </HStack>
      </VStack>

      {/* Error Display */}
      {rowEmbeddingsQuery.error && (
        <Box>
          <Text fontWeight="medium" fontSize="lg" color="red.500" mb={2}>
            Query Error
          </Text>
          <Textarea
            value={`Error: ${rowEmbeddingsQuery.error instanceof Error ? rowEmbeddingsQuery.error.message : rowEmbeddingsQuery.error}`}
            readOnly
            rows={4}
            bg="red.50"
            borderColor="red.200"
            color="red.600"
            fontFamily="mono"
            fontSize="sm"
          />
        </Box>
      )}

      {/* Results Table */}
      {rowEmbeddingsQuery.hasResults && (
        <VStack gap={4} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium" fontSize="lg">
              Search Results
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {tableData.length} match{tableData.length !== 1 ? "es" : ""}
            </Text>
          </HStack>

          <Box overflowX="auto">
            <BasicTable table={table} />
          </Box>
        </VStack>
      )}

      {/* No Results Message */}
      {!rowEmbeddingsQuery.hasResults &&
        !rowEmbeddingsQuery.error &&
        !rowEmbeddingsQuery.isExecuting &&
        rowEmbeddingsQuery.matches.length === 0 &&
        query.trim() && (
          <Box>
            <Text fontWeight="medium" fontSize="lg" mb={2}>
              Search Results
            </Text>
            <Text color="fg.muted">
              No matching records found. Try a different query or schema.
            </Text>
          </Box>
        )}
    </VStack>
  );
};

export default RowEmbeddingsQueryTab;
