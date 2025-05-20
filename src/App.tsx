
import { Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

import Layout from './components/Layout';

import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import EntityPage from './pages/EntityPage';
import GraphPage from './pages/GraphPage';
import LoadPage from './pages/LoadPage';
import FlowsPage from './pages/FlowsPage';
import FlowClassesPage from './pages/FlowClassesPage';
import LibraryPage from './pages/LibraryPage';
import KnowledgeCoresPage from './pages/KnowledgeCoresPage';
import ProcessingPage from './pages/ProcessingPage';
import TokenCostPage from './pages/TokenCostPage';
import PromptsPage from './pages/PromptsPage';
import ToolsPage from './pages/ToolsPage';

import Progress from './components/common/Progress';

import { Toaster } from "./components/ui/toaster"

const App = () => {

  return (
    
    <Box width="100%" minHeight="100vh" bg="colors.background">

      <Router>

        <Layout>
          <Routes>
            <Route path="/" element={<LoadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/load" element={<LoadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/entity" element={<EntityPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            <Route path="/flow-classes" element={<FlowClassesPage />} />
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
      <Toaster />

    </Box>

  );

}

export default App;

