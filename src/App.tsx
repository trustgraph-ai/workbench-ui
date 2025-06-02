import { useEffect } from "react";

import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router";

import Layout from "./components/Layout";

import ChatPage from "./pages/ChatPage";
import SearchPage from "./pages/SearchPage";
import EntityPage from "./pages/EntityPage";
import GraphPage from "./pages/GraphPage";
import LoadPage from "./pages/LoadPage";
import FlowsPage from "./pages/FlowsPage";
//import FlowClassesPage from "./pages/FlowClassesPage";
import LibraryPage from "./pages/LibraryPage";
import KnowledgeCoresPage from "./pages/KnowledgeCoresPage";
import ProcessingPage from "./pages/ProcessingPage";
import TokenCostPage from "./pages/TokenCostPage";
import PromptsPage from "./pages/PromptsPage";
import ToolsPage from "./pages/ToolsPage";

import CenterSpinner from "./components/common/CenterSpinner";
import Progress from "./components/common/Progress";
import { Toaster } from "./components/ui/ToasterComponent";

import { useSocket } from "./api/trustgraph/socket";
import { useProgressStateStore } from "./state/progress";
import { useSessionStore } from "./state/session";

const App = () => {
  const socket = useSocket();

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const setFlowId = useSessionStore((state) => state.setFlowId);
  const setFlow = useSessionStore((state) => state.setFlow);

  useEffect(() => {
    const act = "Load flows";
    addActivity(act);
    socket
      .flows()
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) =>
            socket
              .flows()
              .getFlow(id)
              .then((x) => [id, x]),
          ),
        );
      })
      .then((flows) => {
        removeActivity(act);

        const flowIds = flows.map((fl) => fl[0]);
        if (flowIds.includes("default")) {
          setFlowId("default");
          const flow = flows.filter((fl) => fl[0] == "default")[0][1];
          setFlow(flow);
        } else {
          // No default flow, just pick first in the list.
          setFlowId(flows[0][0]);
          setFlow(flows[0][1]);
        }
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error:", err);
      });
  }, [socket, addActivity, removeActivity, setFlow, setFlowId]);

  return (
    <Box width="100%" minHeight="100vh" bg="colors.background">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/entity" element={<EntityPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            {/*
            <Route path="/flow-classes" element={<FlowClassesPage />} />
*/}
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/kc" element={<KnowledgeCoresPage />} />
            <Route path="/procs" element={<ProcessingPage />} />
            <Route path="/tokencost" element={<TokenCostPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/agents" element={<ToolsPage />} />
          </Routes>
        </Layout>
      </Router>

      <Progress />
      <CenterSpinner />
      <Toaster />
    </Box>
  );
};

export default App;
