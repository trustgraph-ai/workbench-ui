import React, { useCallback } from 'react';
import { Box, VStack, HStack, Heading, Text, Button, Code, Separator } from '@chakra-ui/react';
import { ArrowLeft, FileCode, Construction } from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowClasses } from '../../state/flow-classes';
import serviceMap from '../../data/service-map.json';

interface FlowClassEditorViewProps {
  flowClassId: string;
  onBack: () => void;
}

// Custom node component with handles based on provides/consumes
const CustomNode = ({ data }: { data: { label: string; type?: string; provides?: string[]; consumes?: string[] } }) => {
  const borderColor = data.type === 'class' ? '#2563eb' : '#16a34a'; // blue for class, green for flow
  const backgroundColor = data.type === 'class' ? '#eff6ff' : '#f0fdf4';
  
  const provides = data.provides || [];
  const consumes = data.consumes || [];
  
  // Calculate heights for positioning multiple handles
  const providesHeight = Math.max(50, provides.length * 25 + 30);
  const consumesHeight = Math.max(50, consumes.length * 25 + 30);
  const nodeHeight = Math.max(providesHeight, consumesHeight);
  
  return (
    <div style={{
      padding: '10px 20px',
      border: `2px solid ${borderColor}`,
      borderRadius: '6px',
      background: backgroundColor,
      fontSize: '14px',
      fontWeight: '500',
      position: 'relative',
      minWidth: '150px',
      minHeight: `${nodeHeight}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Provides handles on the left */}
      {provides.length > 0 ? provides.map((service, index) => (
        <React.Fragment key={`provide-${service}`}>
          <Handle
            type="target"
            position={Position.Left}
            id={`provide-${service}`}
            style={{ 
              background: '#16a34a',
              top: `${((index + 1) / (provides.length + 1)) * 100}%`,
            }}
          />
          <div style={{
            position: 'absolute',
            right: `calc(100% + 15px)`,
            top: `calc(${((index + 1) / (provides.length + 1)) * 100}% - 8px)`,
            transform: 'translateY(-50%)',
            fontSize: '9px',
            color: '#16a34a',
            fontWeight: 'normal',
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            {service}
          </div>
        </React.Fragment>
      )) : (
        // Default input handle if no provides data
        <React.Fragment>
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ background: '#555' }}
          />
          <div style={{
            position: 'absolute',
            right: `calc(100% + 15px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            color: '#666',
            fontWeight: 'normal',
            textAlign: 'right',
          }}>
            input
          </div>
        </React.Fragment>
      )}
      
      {/* Consumes handles on the right */}
      {consumes.length > 0 ? consumes.map((service, index) => (
        <React.Fragment key={`consume-${service}`}>
          <Handle
            type="source"
            position={Position.Right}
            id={`consume-${service}`}
            style={{ 
              background: '#dc2626',
              top: `${((index + 1) / (consumes.length + 1)) * 100}%`,
            }}
          />
          <div style={{
            position: 'absolute',
            left: `calc(100% + 15px)`,
            top: `calc(${((index + 1) / (consumes.length + 1)) * 100}% - 8px)`,
            transform: 'translateY(-50%)',
            fontSize: '9px',
            color: '#dc2626',
            fontWeight: 'normal',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}>
            {service}
          </div>
        </React.Fragment>
      )) : (
        // Default output handle if no consumes data
        <React.Fragment>
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ background: '#555' }}
          />
          <div style={{
            position: 'absolute',
            left: `calc(100% + 15px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            color: '#666',
            fontWeight: 'normal',
            textAlign: 'left',
          }}>
            output
          </div>
        </React.Fragment>
      )}
      
      <div style={{ fontSize: '12px', fontWeight: '600' }}>
        {data.label}
      </div>
      {data.type && (
        <div style={{ 
          fontSize: '10px', 
          color: borderColor,
          fontWeight: 'normal',
          marginTop: '2px'
        }}>
          {data.type}
        </div>
      )}
    </div>
  );
};

// Register custom node types
const nodeTypes = {
  custom: CustomNode,
};

// Generate nodes from flow class processors
const generateNodesFromFlowClass = (flowClass: any): Node[] => {
  console.log('generateNodesFromFlowClass called with:', flowClass);
  console.log('Available processors in service map:', Object.keys(serviceMap.processors));
  const nodes: Node[] = [];
  let nodeIndex = 0;
  
  // Add class processors
  console.log('Class processors:', flowClass.class);
  Object.keys(flowClass.class || {}).forEach((processorName) => {
    console.log('Adding class processor:', processorName);
    
    // Strip template suffix to get base processor name for service map lookup
    const baseProcessorName = processorName.replace(/:\{[^}]+\}$/, '');
    console.log('Base processor name for lookup:', baseProcessorName);
    
    // Get provides/consumes from service map
    const processorInfo = serviceMap.processors[baseProcessorName] || { provides: [], consumes: [] };
    console.log(`Processor ${processorName} - provides:`, processorInfo.provides, 'consumes:', processorInfo.consumes);
    
    nodes.push({
      id: `class-${processorName}`,
      position: { x: 100 + (nodeIndex % 3) * 250, y: 100 + Math.floor(nodeIndex / 3) * 150 },
      data: { 
        label: processorName,
        type: 'class',
        provides: processorInfo.provides,
        consumes: processorInfo.consumes
      },
      type: 'custom',
    });
    nodeIndex++;
  });
  
  // Add flow processors
  console.log('Flow processors:', flowClass.flow);
  Object.keys(flowClass.flow || {}).forEach((processorName) => {
    console.log('Adding flow processor:', processorName);
    
    // Strip template suffix to get base processor name for service map lookup
    const baseProcessorName = processorName.replace(/:\{[^}]+\}$/, '');
    console.log('Base processor name for lookup:', baseProcessorName);
    
    // Get provides/consumes from service map
    const processorInfo = serviceMap.processors[baseProcessorName] || { provides: [], consumes: [] };
    console.log(`Processor ${processorName} - provides:`, processorInfo.provides, 'consumes:', processorInfo.consumes);
    
    nodes.push({
      id: `flow-${processorName}`,
      position: { x: 100 + (nodeIndex % 3) * 250, y: 100 + Math.floor(nodeIndex / 3) * 150 },
      data: { 
        label: processorName,
        type: 'flow',
        provides: processorInfo.provides,
        consumes: processorInfo.consumes
      },
      type: 'custom',
    });
    nodeIndex++;
  });
  
  console.log('Generated total nodes:', nodes.length);
  return nodes;
};

// Generate edges from flow class connections
const generateEdgesFromFlowClass = (flowClass: any): Edge[] => {
  console.log('Generating edges from flow class connections');
  const edges: Edge[] = [];
  let edgeIndex = 0;
  
  // Build a map of service providers (processors that have input/request/response queues)
  const serviceProviders = new Map<string, { processorId: string, queueType: string }>();
  
  // Check class processors for providers
  Object.entries(flowClass.class || {}).forEach(([processorName, queues]: [string, any]) => {
    Object.entries(queues).forEach(([queueName, queuePattern]: [string, string]) => {
      if (queueName === 'input' || queueName === 'request' || queueName === 'response') {
        // Extract service name from queue pattern
        const serviceName = queuePattern.replace(/^.*\/\/[^\/]+\/[^\/]+\//, '').replace(/:\{[^}]+\}$/, '');
        serviceProviders.set(serviceName, { 
          processorId: `class-${processorName}`, 
          queueType: queueName 
        });
        console.log(`Provider found: ${processorName} provides ${serviceName} via ${queueName}`);
      }
    });
  });
  
  // Check flow processors for providers
  Object.entries(flowClass.flow || {}).forEach(([processorName, queues]: [string, any]) => {
    Object.entries(queues).forEach(([queueName, queuePattern]: [string, string]) => {
      if (queueName === 'input' || queueName === 'request' || queueName === 'response') {
        const serviceName = queuePattern.replace(/^.*\/\/[^\/]+\/[^\/]+\//, '').replace(/:\{[^}]+\}$/, '');
        serviceProviders.set(serviceName, { 
          processorId: `flow-${processorName}`, 
          queueType: queueName 
        });
        console.log(`Provider found: ${processorName} provides ${serviceName} via ${queueName}`);
      }
    });
  });
  
  // Now find consumers and create edges
  // Check class processors for consumers
  Object.entries(flowClass.class || {}).forEach(([processorName, queues]: [string, any]) => {
    Object.entries(queues).forEach(([queueName, queuePattern]: [string, string]) => {
      if (queueName !== 'input' && queueName !== 'request' && queueName !== 'response' && queueName !== 'output') {
        // This processor consumes a service
        const serviceName = queuePattern.replace(/^.*\/\/[^\/]+\/[^\/]+\//, '').replace(/:\{[^}]+\}$/, '');
        const provider = serviceProviders.get(serviceName);
        
        if (provider) {
          // Create edge from consumer to provider
          const baseProcessorName = processorName.replace(/:\{[^}]+\}$/, '');
          const consumerService = serviceMap.processors[baseProcessorName]?.consumes?.find(s => 
            queuePattern.includes(s)
          ) || queueName;
          
          edges.push({
            id: `edge-${edgeIndex++}`,
            source: `class-${processorName}`,
            target: provider.processorId,
            sourceHandle: `consume-${consumerService}`,
            targetHandle: `provide-${serviceName}`,
            label: queueName,
            type: 'default',
            animated: true,
            style: { stroke: '#2563eb' }
          });
          console.log(`Edge created: class-${processorName} -> ${provider.processorId} for ${serviceName}`);
        }
      }
    });
  });
  
  // Check flow processors for consumers
  Object.entries(flowClass.flow || {}).forEach(([processorName, queues]: [string, any]) => {
    Object.entries(queues).forEach(([queueName, queuePattern]: [string, string]) => {
      if (queueName !== 'input' && queueName !== 'request' && queueName !== 'response' && queueName !== 'output') {
        const serviceName = queuePattern.replace(/^.*\/\/[^\/]+\/[^\/]+\//, '').replace(/:\{[^}]+\}$/, '');
        const provider = serviceProviders.get(serviceName);
        
        if (provider) {
          const baseProcessorName = processorName.replace(/:\{[^}]+\}$/, '');
          const consumerService = serviceMap.processors[baseProcessorName]?.consumes?.find(s => 
            queuePattern.includes(s)
          ) || queueName;
          
          edges.push({
            id: `edge-${edgeIndex++}`,
            source: `flow-${processorName}`,
            target: provider.processorId,
            sourceHandle: `consume-${consumerService}`,
            targetHandle: `provide-${serviceName}`,
            label: queueName,
            type: 'default',
            animated: true,
            style: { stroke: '#16a34a' }
          });
          console.log(`Edge created: flow-${processorName} -> ${provider.processorId} for ${serviceName}`);
        }
      }
    });
  });
  
  console.log(`Generated ${edges.length} edges`);
  return edges;
};

const initialEdges: Edge[] = [];

export const FlowClassEditorView: React.FC<FlowClassEditorViewProps> = ({
  flowClassId,
  onBack,
}) => {
  const { getFlowClass, flowClasses } = useFlowClasses();
  const flowClass = getFlowClass(flowClassId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when flow class data changes
  React.useEffect(() => {
    if (flowClass) {
      console.log('Generating nodes for flow class:', flowClass);
      console.log('Service map loaded:', serviceMap);
      const generatedNodes = generateNodesFromFlowClass(flowClass);
      console.log('Generated nodes:', generatedNodes);
      setNodes(generatedNodes);
      
      // Generate edges from connections
      const generatedEdges = generateEdgesFromFlowClass(flowClass);
      console.log('Generated edges:', generatedEdges);
      setEdges(generatedEdges);
    }
  }, [flowClass, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Debug logging
  console.log('FlowClassEditorView - Looking for ID:', flowClassId);
  console.log('FlowClassEditorView - Available flow classes:', flowClasses);
  console.log('FlowClassEditorView - Found flow class:', flowClass);

  if (!flowClass) {
    return (
      <Box h="100vh" bg="bg.subtle" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Text fontSize="lg">Flow Class Not Found</Text>
          <Text color="fg.muted">ID: {flowClassId}</Text>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </VStack>
      </Box>
    );
  }
  return (
    <Box h="100vh" bg="bg.subtle" display="flex" flexDirection="column">
      {/* Header with back button */}
      <Box
        borderBottom="1px solid"
        borderColor="border.muted"
        bg="bg.default"
        px={6}
        py={3}
      >
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <Button
              leftIcon={<ArrowLeft size={16} />}
              onClick={onBack}
              variant="ghost"
              size="sm"
            >
              Back to Flow Classes
            </Button>
            <Text fontSize="lg" fontWeight="semibold" color="fg.muted">
              Editing: {flowClassId}
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* Main content area - debug information */}
      <Box flex={1} p={6} overflowY="auto">
        <VStack gap={6} align="stretch" maxW="1200px" mx="auto">

          {/* ReactFlow Visualization */}
          <VStack gap={3} align="start">
            <Heading size="lg">Flow Visualization</Heading>
            <Text fontSize="sm" color="fg.muted">Simple ReactFlow demo with hello→world connection</Text>
            <Box w="full" h="400px" border="1px solid" borderColor="border.muted" borderRadius="md" bg="bg.default">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </Box>
          </VStack>

          <Separator />
          
          {/* Basic Info */}
          <VStack gap={3} align="start">
            <Heading size="lg">Flow Class Debug Information</Heading>
            <HStack gap={4}>
              <Text><strong>ID:</strong> {flowClass.id}</Text>
              <Text><strong>Description:</strong> {flowClass.description || 'No description'}</Text>
            </HStack>
            <Text><strong>Tags:</strong> {flowClass.tags?.join(', ') || 'No tags'}</Text>
          </VStack>

          <Separator />

          {/* Class Processors */}
          <VStack gap={3} align="start">
            <Heading size="md">Class Processors ({Object.keys(flowClass.class || {}).length})</Heading>
            <Text fontSize="sm" color="fg.muted">Shared processors using {'{class}'} template variable</Text>
            <Box bg="bg.muted" p={4} borderRadius="md" w="full">
              <VStack gap={2} align="start" fontFamily="mono" fontSize="sm">
                {Object.entries(flowClass.class || {}).map(([processorName, queues]) => (
                  <VStack key={processorName} gap={1} align="start" w="full">
                    <Text fontWeight="bold" color="blue.600">{processorName}</Text>
                    {Object.entries(queues).map(([queueName, queuePattern]) => (
                      <Text key={queueName} pl={4}>
                        └─ <Code fontSize="xs">{queueName}</Code> → <Code fontSize="xs">{queuePattern}</Code>
                      </Text>
                    ))}
                  </VStack>
                ))}
                {Object.keys(flowClass.class || {}).length === 0 && (
                  <Text color="fg.muted">No class processors</Text>
                )}
              </VStack>
            </Box>
          </VStack>

          <Separator />

          {/* Flow Processors */}
          <VStack gap={3} align="start">
            <Heading size="md">Flow Processors ({Object.keys(flowClass.flow || {}).length})</Heading>
            <Text fontSize="sm" color="fg.muted">Flow-specific processors using {'{id}'} template variable</Text>
            <Box bg="bg.muted" p={4} borderRadius="md" w="full">
              <VStack gap={2} align="start" fontFamily="mono" fontSize="sm">
                {Object.entries(flowClass.flow || {}).map(([processorName, queues]) => (
                  <VStack key={processorName} gap={1} align="start" w="full">
                    <Text fontWeight="bold" color="green.600">{processorName}</Text>
                    {Object.entries(queues).map(([queueName, queuePattern]) => (
                      <Text key={queueName} pl={4}>
                        └─ <Code fontSize="xs">{queueName}</Code> → <Code fontSize="xs">{queuePattern}</Code>
                      </Text>
                    ))}
                  </VStack>
                ))}
                {Object.keys(flowClass.flow || {}).length === 0 && (
                  <Text color="fg.muted">No flow processors</Text>
                )}
              </VStack>
            </Box>
          </VStack>

          <Separator />

          {/* Interfaces */}
          <VStack gap={3} align="start">
            <Heading size="md">Interfaces ({Object.keys(flowClass.interfaces || {}).length})</Heading>
            <Text fontSize="sm" color="fg.muted">External interfaces for the flow class</Text>
            <Box bg="bg.muted" p={4} borderRadius="md" w="full">
              <VStack gap={2} align="start" fontFamily="mono" fontSize="sm">
                {Object.entries(flowClass.interfaces || {}).map(([interfaceName, interfaceValue]) => (
                  <VStack key={interfaceName} gap={1} align="start" w="full">
                    <Text fontWeight="bold" color="purple.600">{interfaceName}</Text>
                    {typeof interfaceValue === 'string' ? (
                      <Text pl={4}>
                        └─ <Code fontSize="xs">{interfaceValue}</Code>
                      </Text>
                    ) : (
                      <>
                        <Text pl={4}>
                          └─ request: <Code fontSize="xs">{interfaceValue.request}</Code>
                        </Text>
                        <Text pl={4}>
                          └─ response: <Code fontSize="xs">{interfaceValue.response}</Code>
                        </Text>
                      </>
                    )}
                  </VStack>
                ))}
                {Object.keys(flowClass.interfaces || {}).length === 0 && (
                  <Text color="fg.muted">No interfaces</Text>
                )}
              </VStack>
            </Box>
          </VStack>

          <Separator />

          {/* Service Graph Connections */}
          <VStack gap={3} align="start">
            <Heading size="md">Service Graph Connections</Heading>
            <Text fontSize="sm" color="fg.muted">
              Shows how processors connect through shared queue names (providers → consumers)
            </Text>
            <Box bg="bg.muted" p={4} borderRadius="md" w="full">
              <VStack gap={3} align="start" fontFamily="mono" fontSize="sm">
                {(() => {
                  // Build service providers map (processors that implement input/request/response queues)
                  const providers = new Map<string, { processor: string, type: 'class' | 'flow', queueType: string }>();
                  
                  // Collect all service providers from class processors
                  Object.entries(flowClass.class || {}).forEach(([processorName, queues]) => {
                    Object.entries(queues).forEach(([queueName, queuePattern]) => {
                      if (queueName === 'input' || queueName === 'request' || queueName === 'response') {
                        // Extract the service name from the pattern (remove template variables)
                        const serviceName = queuePattern.replace(/-\{class\}$/, '').replace(/-\{id\}$/, '');
                        providers.set(serviceName, { 
                          processor: processorName, 
                          type: 'class',
                          queueType: queueName 
                        });
                      }
                    });
                  });

                  // Collect all service providers from flow processors  
                  Object.entries(flowClass.flow || {}).forEach(([processorName, queues]) => {
                    Object.entries(queues).forEach(([queueName, queuePattern]) => {
                      if (queueName === 'input' || queueName === 'request' || queueName === 'response') {
                        const serviceName = queuePattern.replace(/-\{class\}$/, '').replace(/-\{id\}$/, '');
                        providers.set(serviceName, { 
                          processor: processorName, 
                          type: 'flow',
                          queueType: queueName 
                        });
                      }
                    });
                  });

                  // Build connections by finding consumers that use these services
                  const connections: Array<{
                    provider: string;
                    providerType: 'class' | 'flow';
                    providerQueueType: string;
                    serviceName: string;
                    consumers: Array<{ processor: string; type: 'class' | 'flow' }>;
                  }> = [];

                  providers.forEach((providerInfo, serviceName) => {
                    const consumers: Array<{ processor: string; type: 'class' | 'flow' }> = [];
                    
                    // Check class processors for consumers
                    Object.entries(flowClass.class || {}).forEach(([processorName, queues]) => {
                      Object.entries(queues).forEach(([queueName, queuePattern]) => {
                        if (queueName !== 'input' && queueName !== 'request' && queueName !== 'response') {
                          const consumerServiceName = queuePattern.replace(/-\{class\}$/, '').replace(/-\{id\}$/, '');
                          if (consumerServiceName === serviceName) {
                            consumers.push({ processor: processorName, type: 'class' });
                          }
                        }
                      });
                    });

                    // Check flow processors for consumers
                    Object.entries(flowClass.flow || {}).forEach(([processorName, queues]) => {
                      Object.entries(queues).forEach(([queueName, queuePattern]) => {
                        if (queueName !== 'input' && queueName !== 'request' && queueName !== 'response') {
                          const consumerServiceName = queuePattern.replace(/-\{class\}$/, '').replace(/-\{id\}$/, '');
                          if (consumerServiceName === serviceName) {
                            consumers.push({ processor: processorName, type: 'flow' });
                          }
                        }
                      });
                    });

                    connections.push({
                      provider: providerInfo.processor,
                      providerType: providerInfo.type,
                      providerQueueType: providerInfo.queueType,
                      serviceName,
                      consumers
                    });
                  });

                  // Render connections
                  if (connections.length === 0) {
                    return <Text color="fg.muted">No service connections found</Text>;
                  }

                  return connections.map((connection, index) => (
                    <VStack key={index} gap={1} align="start" w="full">
                      <Text fontWeight="bold" color="orange.600">
                        Service: {connection.serviceName}
                      </Text>
                      <Text pl={4}>
                        🔧 Provider: <Code fontSize="xs" color="blue.600">{connection.provider}</Code> 
                        <Code fontSize="xs" color="gray.600">({connection.providerType})</Code> 
                        via <Code fontSize="xs">{connection.providerQueueType}</Code>
                      </Text>
                      {connection.consumers.length > 0 ? (
                        connection.consumers.map((consumer, consumerIndex) => (
                          <Text key={consumerIndex} pl={4}>
                            📤 Consumer: <Code fontSize="xs" color="green.600">{consumer.processor}</Code>
                            <Code fontSize="xs" color="gray.600">({consumer.type})</Code>
                          </Text>
                        ))
                      ) : (
                        <Text pl={4} color="fg.muted">
                          📤 No consumers found
                        </Text>
                      )}
                      {index < connections.length - 1 && <Text>│</Text>}
                    </VStack>
                  ));
                })()}
              </VStack>
            </Box>
          </VStack>

          <Separator />

          {/* Raw JSON */}
          <VStack gap={3} align="start">
            <Heading size="md">Raw JSON Data</Heading>
            <Box bg="bg.muted" p={4} borderRadius="md" w="full" overflowX="auto">
              <Code fontSize="xs" whiteSpace="pre" display="block">
                {JSON.stringify(flowClass, null, 2)}
              </Code>
            </Box>
          </VStack>

        </VStack>
      </Box>
    </Box>
  );
};