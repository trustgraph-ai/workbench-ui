import React from "react";

import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Heading,
  Separator,
  chakra,
} from "@chakra-ui/react";

import { NavLink as ReactRouterNavLink } from "react-router";
import { useSettings } from "../state/settings";

const ChakraNavLink = chakra(ReactRouterNavLink);

import {
  TestTube2,
  Hammer,
  Plug,
  MessageSquareText,
  Search,
  Waypoints,
  Rotate3d,
  //  FileUp,
  Workflow,
  //  ScrollText,
  LibraryBig,
  BrainCircuit,
  CircleArrowRight,
  HandCoins,
  MessageCircleCode,
  Database,
  Network,
  Settings,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <ChakraNavLink to={to} width="100%">
      {({ isActive }: { isActive: boolean }) => (
        <Flex
          align="center"
          p={3}
          mx={3}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? "{colors.primary.solid}" : "transparent"}
          color={isActive ? "colors.primary.solid" : "gray.500"}
          _hover={{ bg: isActive ? "colors.primary.contrast" : "gray.200" }}
          transition="all 0.2s"
        >
          <Icon as={icon} mr={4} fontSize="16" />
          <Text fontWeight="medium">{label}</Text>
        </Flex>
      )}
    </ChakraNavLink>
  );
};

const Sidebar = () => {
  const { settings } = useSettings();

  return (
    <Box
      bg="colors.background"
      borderRight="1px"
      borderRightColor="gray.200"
      width={{ base: "70px", md: "250px" }}
      position="sticky"
      top="0"
      height="100vh"
      boxShadow="sm"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box color="{colors.primary.fg}">
          <TestTube2 />
        </Box>
        <Heading
          fontSize="2xl"
          fontWeight="bold"
          color="primary.solid"
          display={{
            base: "none",
            md: "block",
          }}
        >
          TrustGraph
        </Heading>
        <Box
          display={{
            base: "block",
            md: "none",
          }}
          fontSize="2xl"
          fontWeight="bold"
          color="#5285ed"
        >
          TG
        </Box>
      </Flex>

      <Separator />

      <VStack gap={1} align="stretch" mt={5}>
        <NavItem to="/search" icon={Search} label="Vector Search" />
        <NavItem to="/chat" icon={MessageSquareText} label="Assistant" />
        <NavItem to="/entity" icon={Waypoints} label="Relationships" />
        <NavItem to="/graph" icon={Rotate3d} label="Graph Visualizer" />
        <NavItem to="/library" icon={LibraryBig} label="Library" />
        {/*
        <NavItem to="/flow-classes" icon={ScrollText} label="Flow Classes" />
*/}
        <NavItem to="/flows" icon={Workflow} label="Flows" />
        <NavItem to="/kc" icon={BrainCircuit} label="Knowledge Cores" />
        {settings.featureSwitches.submissions && (
          <NavItem to="/procs" icon={CircleArrowRight} label="Submissions" />
        )}
        <NavItem to="/tokencost" icon={HandCoins} label="Token Cost" />
        <NavItem to="/prompts" icon={MessageCircleCode} label="Prompts" />
        <NavItem to="/schemas" icon={Database} label="Schemas" />
        {settings.featureSwitches.taxonomyEditor && (
          <NavItem to="/taxonomies" icon={Network} label="Taxonomies" />
        )}
        <NavItem to="/agents" icon={Hammer} label="Agent Tools" />
        <NavItem to="/mcp-tools" icon={Plug} label="MCP Tools" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </VStack>
    </Box>
  );
};

export default Sidebar;
