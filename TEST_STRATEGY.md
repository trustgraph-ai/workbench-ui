# Test Strategy for TrustGraph UI

## Overview

This document outlines the comprehensive testing strategy for the TrustGraph UI application, a React-based knowledge graph visualization and chat interface built with TypeScript, Vite, and Chakra UI.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Chakra UI v3
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Visualization**: React Force Graph (3D), Three.js
- **WebSocket**: Custom socket implementation for real-time communication
- **Build Tools**: Vite, ESLint, Prettier

## Testing Approach

### 1. Unit Testing

#### Framework Recommendation
- **Jest** + **React Testing Library** for component testing
- **Vitest** (recommended for Vite projects) as Jest alternative
- **@testing-library/jest-dom** for DOM assertions

#### What to Test
- **State Management (Zustand stores)**:
  - `src/state/chat.ts` - Chat state management
  - `src/state/session.ts` - Session state
  - `src/state/workbench.ts` - Workbench state
  - `src/state/graph-query.ts` - Graph query state
  - All other state modules in `src/state/`

- **Utility Functions**:
  - `src/utils/knowledge-graph.ts` - Graph manipulation utilities
  - `src/utils/document-encoding.ts` - Document encoding/decoding
  - `src/utils/vector-search.ts` - Vector search utilities
  - `src/utils/time-string.ts` - Time formatting utilities

- **API Layer**:
  - `src/api/trustgraph/socket.ts` - WebSocket connection
  - `src/api/trustgraph/service-call.ts` - Service call utilities
  - `src/api/trustgraph/messages.ts` - Message handling

#### Test Structure
```
tests/
├── unit/
│   ├── components/
│   ├── state/
│   ├── utils/
│   ├── api/
│   └── model/
├── integration/
├── e2e/
└── fixtures/
```

### 2. Component Testing

#### Core Components to Test
- **Chat Components**:
  - `src/components/chat/ChatConversation.tsx`
  - `src/components/chat/ChatMessage.tsx`
  - `src/components/chat/InputArea.tsx`
  - `src/components/chat/ChatModeSelector.tsx`

- **Graph Components**:
  - `src/components/graph/Graph.tsx`
  - `src/components/entity/EntityDetail.tsx`
  - `src/components/entity/EntityNode.tsx`

- **Common Components**:
  - `src/components/common/BasicTable.tsx`
  - `src/components/common/SelectableTable.tsx`
  - `src/components/common/TextField.tsx`
  - `src/components/common/Card.tsx`

- **Layout Components**:
  - `src/components/Layout.tsx`
  - `src/components/Sidebar.tsx`

#### Testing Strategies
- **Snapshot Testing** for UI consistency
- **User Interaction Testing** (click, input, navigation)
- **Props Testing** and component behavior
- **Error Boundary Testing**
- **Accessibility Testing** (screen reader, keyboard navigation)

### 3. Integration Testing

#### Areas to Test
- **WebSocket Integration**: Test real-time communication with backend
- **State Persistence**: Test Zustand store persistence
- **Route Navigation**: Test React Router integration
- **API Integration**: Test service calls and data flow
- **Component Interaction**: Test parent-child component communication

#### Mock Strategy
- Mock WebSocket connections for consistent testing
- Mock external APIs and services
- Mock file upload/download operations
- Mock 3D graph rendering for performance

### 4. End-to-End Testing

#### Framework Recommendation
- **Playwright** or **Cypress** for cross-browser testing

#### Test Scenarios
1. **User Authentication Flow**
2. **Chat Interface**:
   - Send messages in different modes (graph-rag, agent, basic-llm)
   - Receive and display responses
   - Chat history persistence

3. **Knowledge Graph Visualization**:
   - Load and display graph data
   - Node interaction and navigation
   - Graph filtering and search

4. **Document Management**:
   - Upload documents
   - Process and index documents
   - Search through document library

5. **Flow Management**:
   - Create and edit processing flows
   - Execute flows with different parameters

6. **Agent Tools**:
   - Configure MCP tools
   - Test agent interactions
   - Tool execution and results

### 5. Performance Testing

#### Areas to Monitor
- **Bundle Size**: Monitor JavaScript bundle size
- **3D Graph Rendering**: Test performance with large graphs
- **Memory Usage**: Monitor memory leaks in long-running sessions
- **WebSocket Performance**: Test real-time communication under load

#### Tools
- **Lighthouse** for web performance metrics
- **Bundle Analyzer** for bundle size optimization
- **React DevTools Profiler** for component performance

### 6. Accessibility Testing

#### Requirements
- **WCAG 2.1 AA** compliance
- **Screen Reader** compatibility
- **Keyboard Navigation** support
- **Color Contrast** validation

#### Tools
- **axe-core** for automated accessibility testing
- **React Testing Library** accessibility queries
- **Manual testing** with screen readers

## Testing Infrastructure

### Setup Requirements
```bash
# Install testing dependencies
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @vitest/ui \
  playwright
```

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - E2E test configuration
- `test-setup.ts` - Global test setup

### CI/CD Integration
- **GitHub Actions** workflow for automated testing
- **Pre-commit hooks** for running tests before commits
- **Coverage reporting** with minimum thresholds
- **Visual regression testing** for UI components

## Test Data Management

### Mock Data Strategy
- **Fixtures**: Static test data for consistent testing
- **Factory Functions**: Generate test data programmatically
- **MSW (Mock Service Worker)**: Mock API responses
- **WebSocket Mocking**: Mock real-time communication

### Data Categories
- **Graph Data**: Nodes, edges, and relationships
- **Chat Messages**: Various message types and formats
- **User Sessions**: Authentication and session data
- **Document Metadata**: File information and processing status

## Coverage Goals

### Minimum Coverage Targets
- **Unit Tests**: 80% line coverage
- **Integration Tests**: Cover all major user flows
- **E2E Tests**: Cover critical business paths
- **Component Tests**: 90% of UI components

### Exclusions
- Third-party library code
- Generated type definitions
- Development-only code

## Testing Best Practices

### General Guidelines
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Keep tests independent and isolated**
4. **Test error conditions and edge cases**
5. **Maintain test data consistency**

### React-Specific Guidelines
1. **Test user interactions, not internal state**
2. **Use React Testing Library queries effectively**
3. **Test accessibility features**
4. **Mock external dependencies**
5. **Test component composition**

## Monitoring and Maintenance

### Test Health
- **Flaky Test Detection**: Monitor and fix unstable tests
- **Test Performance**: Keep test execution time reasonable
- **Coverage Trends**: Monitor coverage over time
- **Test Maintenance**: Regular review and cleanup

### Quality Gates
- **All tests must pass** before merging
- **Coverage thresholds** must be maintained
- **Performance budgets** must not be exceeded
- **Accessibility standards** must be met

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Set up testing framework and infrastructure
- Implement utility function tests
- Create basic component tests for common components

### Phase 2: Core Features (Weeks 3-4)
- Test state management (Zustand stores)
- Test API layer and WebSocket integration
- Implement chat and graph component tests

### Phase 3: Integration & E2E (Weeks 5-6)
- Set up integration testing
- Implement critical E2E test scenarios
- Set up CI/CD pipeline integration

### Phase 4: Advanced Testing (Weeks 7-8)
- Performance testing setup
- Accessibility testing implementation
- Visual regression testing
- Test optimization and maintenance procedures

## Success Metrics

- **Test Coverage**: Achieve and maintain 80%+ coverage
- **Test Reliability**: < 1% flaky test rate
- **Test Performance**: Test suite completes in < 5 minutes
- **Bug Detection**: Catch 90%+ of bugs before production
- **Developer Experience**: Tests provide clear feedback and are easy to maintain

## Conclusion

This testing strategy provides comprehensive coverage for the TrustGraph UI application, ensuring reliability, performance, and maintainability. The phased implementation approach allows for gradual adoption while maintaining development velocity.

Regular review and updates of this strategy will ensure it remains effective as the application evolves and new features are added.