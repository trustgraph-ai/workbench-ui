import React, { useMemo } from "react";
import {
  Field,
  Select,
  Portal,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";

export interface XSDDatatype {
  value: string;
  label: string;
  category: string;
  description?: string;
}

interface XSDDatatypeSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  contentRef?: any;
}

// Comprehensive XSD datatype definitions with descriptions
const XSD_DATATYPES: XSDDatatype[] = [
  // Text and String Types
  {
    value: "xsd:string",
    label: "String",
    category: "Text & Strings",
    description: "Unicode character sequence"
  },
  {
    value: "xsd:normalizedString",
    label: "Normalized String",
    category: "Text & Strings",
    description: "String with normalized whitespace"
  },
  {
    value: "xsd:token",
    label: "Token",
    category: "Text & Strings",
    description: "String without leading/trailing whitespace"
  },
  {
    value: "xsd:language",
    label: "Language Code",
    category: "Text & Strings",
    description: "RFC 3066 language identifier (e.g., en-US)"
  },

  // Numeric Types - Integers
  {
    value: "xsd:integer",
    label: "Integer",
    category: "Numbers (Integers)",
    description: "Arbitrary precision integer"
  },
  {
    value: "xsd:int",
    label: "32-bit Integer",
    category: "Numbers (Integers)",
    description: "32-bit signed integer (-2,147,483,648 to 2,147,483,647)"
  },
  {
    value: "xsd:long",
    label: "64-bit Integer",
    category: "Numbers (Integers)",
    description: "64-bit signed integer"
  },
  {
    value: "xsd:short",
    label: "16-bit Integer",
    category: "Numbers (Integers)",
    description: "16-bit signed integer (-32,768 to 32,767)"
  },
  {
    value: "xsd:byte",
    label: "8-bit Integer",
    category: "Numbers (Integers)",
    description: "8-bit signed integer (-128 to 127)"
  },
  {
    value: "xsd:positiveInteger",
    label: "Positive Integer",
    category: "Numbers (Integers)",
    description: "Integer greater than zero"
  },
  {
    value: "xsd:nonNegativeInteger",
    label: "Non-negative Integer",
    category: "Numbers (Integers)",
    description: "Integer greater than or equal to zero"
  },
  {
    value: "xsd:negativeInteger",
    label: "Negative Integer",
    category: "Numbers (Integers)",
    description: "Integer less than zero"
  },

  // Numeric Types - Decimals
  {
    value: "xsd:decimal",
    label: "Decimal",
    category: "Numbers (Decimals)",
    description: "Arbitrary precision decimal number"
  },
  {
    value: "xsd:float",
    label: "Float",
    category: "Numbers (Decimals)",
    description: "32-bit floating point number"
  },
  {
    value: "xsd:double",
    label: "Double",
    category: "Numbers (Decimals)",
    description: "64-bit floating point number"
  },

  // Date and Time
  {
    value: "xsd:dateTime",
    label: "Date and Time",
    category: "Date & Time",
    description: "Complete date and time (YYYY-MM-DDTHH:MM:SS)"
  },
  {
    value: "xsd:date",
    label: "Date",
    category: "Date & Time",
    description: "Calendar date (YYYY-MM-DD)"
  },
  {
    value: "xsd:time",
    label: "Time",
    category: "Date & Time",
    description: "Time of day (HH:MM:SS)"
  },
  {
    value: "xsd:gYear",
    label: "Year",
    category: "Date & Time",
    description: "Gregorian calendar year (YYYY)"
  },
  {
    value: "xsd:gMonth",
    label: "Month",
    category: "Date & Time",
    description: "Gregorian calendar month (--MM)"
  },
  {
    value: "xsd:gDay",
    label: "Day",
    category: "Date & Time",
    description: "Gregorian calendar day (---DD)"
  },
  {
    value: "xsd:duration",
    label: "Duration",
    category: "Date & Time",
    description: "Time duration (P1Y2M3DT4H5M6S)"
  },

  // Boolean and Binary
  {
    value: "xsd:boolean",
    label: "Boolean",
    category: "Other Types",
    description: "True or false value"
  },
  {
    value: "xsd:base64Binary",
    label: "Base64 Binary",
    category: "Other Types",
    description: "Base64-encoded binary data"
  },
  {
    value: "xsd:hexBinary",
    label: "Hex Binary",
    category: "Other Types",
    description: "Hexadecimal-encoded binary data"
  },

  // URIs and References
  {
    value: "xsd:anyURI",
    label: "URI",
    category: "Other Types",
    description: "Uniform Resource Identifier"
  },
];

const XSDDatatypeSelector: React.FC<XSDDatatypeSelectorProps> = ({
  label,
  value,
  onValueChange,
  contentRef,
}) => {
  // Group datatypes by category
  const groupedDatatypes = useMemo(() => {
    const groups: Record<string, XSDDatatype[]> = {};
    XSD_DATATYPES.forEach((datatype) => {
      if (!groups[datatype.category]) {
        groups[datatype.category] = [];
      }
      groups[datatype.category].push(datatype);
    });
    return groups;
  }, []);

  // Create simple flat list for collection (headers will be handled in rendering)
  const flattenedItems = useMemo(() => {
    const items: any[] = [];
    XSD_DATATYPES.forEach((datatype) => {
      items.push({
        value: datatype.value,
        label: datatype.label,
        description: datatype.description,
        category: datatype.category,
      });
    });
    return items;
  }, []);

  const collection = useMemo(
    () => createListCollection({ items: flattenedItems }),
    [flattenedItems],
  );

  const selectedDatatype = XSD_DATATYPES.find(dt => dt.value === value);

  return (
    <Field.Root mb={4}>
      <Field.Label fontWeight="medium">{label}</Field.Label>

      <Select.Root
        collection={collection}
        value={value}
        onValueChange={(e) => onValueChange(e.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select XSD datatype">
              {selectedDatatype ? `${selectedDatatype.label} (${selectedDatatype.value})` : "Select datatype"}
            </Select.ValueText>
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal container={contentRef}>
          <Select.Positioner>
            <Select.Content maxH="300px" overflowY="auto">
              {Object.entries(groupedDatatypes).map(([category, datatypes]) => (
                <React.Fragment key={category}>
                  <Text
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.600"
                    bg="gray.100"
                    borderBottomWidth="1px"
                  >
                    {category}
                  </Text>
                  {datatypes.map((datatype) => (
                    <Select.Item
                      item={datatype.value}
                      key={datatype.value}
                    >
                      <Stack gap={1}>
                        <Text fontWeight="medium">{datatype.label}</Text>
                        {datatype.description && (
                          <Text fontSize="xs" color="gray.500">
                            {datatype.description}
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.400" fontFamily="mono">
                          {datatype.value}
                        </Text>
                      </Stack>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </React.Fragment>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
};

export default XSDDatatypeSelector;