
import React from 'react';

import SystemPromptHelp from './help/SystemPrompt';
import ExtractDefinitionsPromptHelp from './help/ExtractDefinitionsPrompt';
import ExtractRelationshipsPromptHelp from './help/ExtractRelationshipsPrompt';
import ExtractTopicsPromptHelp from './help/ExtractTopicsPrompt';
import ExtractRowsPromptHelp from './help/ExtractRowsPrompt';
import KnowledgeQueryPromptHelp from './help/KnowledgeQueryPrompt';
import DocumentQueryPromptHelp from './help/DocumentQueryPrompt';
import AgentReactPromptHelp from './help/AgentReactPrompt';

export const helpInformation : { [key : string] : React.ReactNode } = {
    "system-template": <SystemPromptHelp/>,
    "extract-definitions": <ExtractDefinitionsPromptHelp/>,
    "extract-relationships": <ExtractRelationshipsPromptHelp/>,
    "extract-topics": <ExtractTopicsPromptHelp/>,
    "extract-rows": <ExtractRowsPromptHelp/>,
    "kg-prompt": <KnowledgeQueryPromptHelp/>,
    "document-prompt": <DocumentQueryPromptHelp/>,
    "agent-react": <AgentReactPromptHelp/>,
};
