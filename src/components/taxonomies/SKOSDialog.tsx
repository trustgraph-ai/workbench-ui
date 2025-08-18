import React, { useState, useRef } from "react";
import {
  Dialog,
  Portal,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  Tabs,
  Box,
  Badge,
  Alert,
  Separator,
  IconButton,
  Code,
} from "@chakra-ui/react";
import { Download, Upload, Copy, Check, AlertTriangle, Info, X } from "lucide-react";
import { useNotification } from "../../state/notify";
import { Taxonomy } from "../../state/taxonomies";
import { serializeToSKOS, parseFromSKOS } from "../../utils/skos";
import { validateTaxonomy, ValidationResult } from "../../utils/skos-validation";
import SelectField from "../common/SelectField";

interface SKOSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxonomy?: Taxonomy;
  mode: "export" | "import";
  onImport?: (taxonomy: Taxonomy, taxonomyId: string) => void;
}

export const SKOSDialog: React.FC<SKOSDialogProps> = ({
  open,
  onOpenChange,
  taxonomy,
  mode,
  onImport,
}) => {
  const [format, setFormat] = useState<'rdf' | 'turtle'>('rdf');
  const [content, setContent] = useState('');
  const [importId, setImportId] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const notify = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!taxonomy) return;
    
    try {
      const exported = serializeToSKOS(taxonomy, format);
      setContent(exported);
      
      // Also validate the taxonomy
      const validationResult = validateTaxonomy(taxonomy);
      setValidation(validationResult);
      
    } catch (error) {
      notify.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (!content.trim() || !importId.trim()) {
      notify.error('Please provide both SKOS content and taxonomy ID');
      return;
    }

    setIsProcessing(true);
    try {
      const imported = await parseFromSKOS(content, importId, format);
      
      // Validate the imported taxonomy
      const validationResult = validateTaxonomy(imported);
      setValidation(validationResult);
      
      if (validationResult.errors.length > 0) {
        notify.error(`Import validation failed with ${validationResult.errors.length} errors`);
        return;
      }
      
      if (onImport) {
        onImport(imported, importId);
        notify.success('SKOS taxonomy imported successfully');
        onOpenChange(false);
      }
    } catch (error) {
      notify.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      notify.success('SKOS content copied to clipboard');
    } catch {
      notify.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    if (!content || !taxonomy) return;
    
    const extension = format === 'turtle' ? 'ttl' : 'rdf';
    const mimeType = format === 'turtle' ? 'text/turtle' : 'application/rdf+xml';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${taxonomy.metadata.name.replace(/\s+/g, '-')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    notify.success(`SKOS ${format.toUpperCase()} file downloaded`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      
      // Auto-detect format from file extension
      if (file.name.endsWith('.ttl')) {
        setFormat('turtle');
      } else if (file.name.endsWith('.rdf') || file.name.endsWith('.xml')) {
        setFormat('rdf');
      }
      
      // Set default import ID from filename
      const baseName = file.name.replace(/\.(ttl|rdf|xml)$/, '');
      setImportId(baseName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());
    };
    reader.readAsText(file);
  };

  const renderValidation = () => {
    if (!validation) return null;

    return (
      <Box>
        <Text fontSize="sm" fontWeight="bold" mb={2}>Validation Results</Text>
        
        {validation.errors.length > 0 && (
          <Alert status="error" mb={2}>
            <AlertTriangle size={16} />
            <Text ml={2}>{validation.errors.length} error(s) found</Text>
          </Alert>
        )}
        
        {validation.warnings.length > 0 && (
          <Alert status="warning" mb={2}>
            <AlertTriangle size={16} />
            <Text ml={2}>{validation.warnings.length} warning(s) found</Text>
          </Alert>
        )}
        
        {validation.isValid && (
          <Alert status="success" mb={2}>
            <Check size={16} />
            <Text ml={2}>SKOS validation passed</Text>
          </Alert>
        )}

        {/* Show first few errors/warnings */}
        {[...validation.errors.slice(0, 3), ...validation.warnings.slice(0, 2)].map((issue, index) => (
          <Box key={index} p={2} bg="bg.muted" borderRadius="md" mb={1} fontSize="sm">
            <HStack>
              {issue.type === 'error' ? (
                <X size={12} color="red" />
              ) : (
                <AlertTriangle size={12} color="orange" />
              )}
              <Text flex="1">{issue.message}</Text>
              {issue.conceptId && (
                <Badge size="xs" variant="outline">{issue.conceptId}</Badge>
              )}
            </HStack>
          </Box>
        ))}
      </Box>
    );
  };

  React.useEffect(() => {
    if (open && mode === 'export' && taxonomy) {
      handleExport();
    }
  }, [open, mode, taxonomy, format]);

  React.useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setContent('');
      setImportId('');
      setValidation(null);
      setCopied(false);
      setIsProcessing(false);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="6xl" maxH="90vh">
            <Dialog.Header>
              <Dialog.Title>
                {mode === 'export' ? 'Export SKOS' : 'Import SKOS'}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body overflowY="auto">
              <VStack gap={4} align="stretch">
                {/* Format Selection */}
                <SelectField
                  label="SKOS Format"
                  items={[
                    { value: 'rdf', label: 'RDF/XML', description: 'RDF/XML (.rdf)' },
                    { value: 'turtle', label: 'Turtle', description: 'Turtle (.ttl)' },
                  ]}
                  value={format}
                  onValueChange={(value) => setFormat(value as 'rdf' | 'turtle')}
                />

                {mode === 'import' && (
                  <>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>Import Source</Text>
                      <HStack>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                        >
                          <Upload size={16} />
                          Choose File
                        </Button>
                        <Text fontSize="sm" color="fg.muted">
                          Or paste SKOS content below
                        </Text>
                      </HStack>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".rdf,.xml,.ttl"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>Taxonomy ID</Text>
                      <Textarea
                        value={importId}
                        onChange={(e) => setImportId(e.target.value)}
                        placeholder="Enter unique taxonomy ID (e.g., 'risk-categories')"
                        rows={1}
                        resize="none"
                      />
                    </Box>
                  </>
                )}

                <Separator />

                <Tabs.Root defaultValue="content">
                  <Tabs.List>
                    <Tabs.Trigger value="content">SKOS Content</Tabs.Trigger>
                    {validation && (
                      <Tabs.Trigger value="validation">
                        Validation 
                        <Badge 
                          ml={2} 
                          colorPalette={validation.isValid ? "primary" : "red"}
                          size="xs"
                        >
                          {validation.errors.length > 0 ? validation.errors.length : '✓'}
                        </Badge>
                      </Tabs.Trigger>
                    )}
                  </Tabs.List>

                  <Tabs.Content value="content">
                    <VStack gap={3} align="stretch">
                      {mode === 'export' && (
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="fg.muted">
                            Generated SKOS {format.toUpperCase()}
                          </Text>
                          <HStack>
                            <IconButton
                              aria-label="Copy"
                              size="sm"
                              variant="outline"
                              onClick={handleCopy}
                              disabled={!content}
                            >
                              {copied ? <Check size={16} /> : <Copy size={16} />}
                            </IconButton>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDownload}
                              disabled={!content}
                            >
                              <Download size={16} />
                              Download
                            </Button>
                          </HStack>
                        </HStack>
                      )}

                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                          mode === 'import' 
                            ? 'Paste SKOS content here...'
                            : 'SKOS content will appear here'
                        }
                        rows={20}
                        fontFamily="mono"
                        fontSize="sm"
                        readOnly={mode === 'export'}
                      />
                    </VStack>
                  </Tabs.Content>

                  <Tabs.Content value="validation">
                    {renderValidation()}
                  </Tabs.Content>
                </Tabs.Root>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                >
                  {mode === 'export' ? 'Close' : 'Cancel'}
                </Button>
                
                {mode === 'export' && (
                  <Button
                    colorPalette="primary"
                    onClick={handleExport}
                  >
                    Regenerate
                  </Button>
                )}
                
                {mode === 'import' && (
                  <Button
                    colorPalette="primary"
                    onClick={handleImport}
                    disabled={!content.trim() || !importId.trim() || isProcessing}
                    loading={isProcessing}
                  >
                    Import Taxonomy
                  </Button>
                )}
              </HStack>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};