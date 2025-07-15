import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EntityDetail from '../EntityDetail'

// Mock react-router
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Alert: {
    Root: ({ children, ...props }: any) => <div data-testid="alert-root" {...props}>{children}</div>,
    Indicator: ({ ...props }: any) => <div data-testid="alert-indicator" {...props} />,
    Title: ({ children, ...props }: any) => <div data-testid="alert-title" {...props}>{children}</div>,
  },
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  ),
  Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
  Heading: ({ children, ...props }: any) => <h1 data-testid="heading" {...props}>{children}</h1>,
  HStack: ({ children, ...props }: any) => <div data-testid="hstack" {...props}>{children}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Rotate3d: () => <div data-testid="rotate3d-icon">Rotate3d</div>,
  ArrowBigRight: () => <div data-testid="arrow-big-right-icon">ArrowBigRight</div>,
}))

// Mock state stores
const mockWorkbenchState = {
  selected: null,
}

const mockSessionState = {
  flowId: 'test-flow-id',
}

vi.mock('../../state/workbench', () => ({
  useWorkbenchStateStore: vi.fn((selector) => selector(mockWorkbenchState)),
}))

vi.mock('../../state/session', () => ({
  useSessionStore: vi.fn((selector) => selector(mockSessionState)),
}))

// Mock entity detail hook
const mockEntityDetail = {
  detail: null,
  isLoading: false,
  isError: false,
}

vi.mock('../../state/entity-query', () => ({
  useEntityDetail: vi.fn(() => mockEntityDetail),
}))

// Mock components
vi.mock('./EntityHelp', () => ({
  default: () => <div data-testid="entity-help">EntityHelp</div>,
}))

vi.mock('./ElementNode', () => ({
  default: ({ value, selected }: any) => (
    <div data-testid="element-node">
      {value.v} ({value.t})
    </div>
  ),
}))

describe('EntityDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWorkbenchState.selected = null
    mockEntityDetail.detail = null
    mockEntityDetail.isLoading = false
    mockEntityDetail.isError = false
  })

  it('should show info message when no entity is selected', () => {
    mockWorkbenchState.selected = null
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('alert-root')).toBeInTheDocument()
    expect(screen.getByTestId('alert-title')).toHaveTextContent('No data to view. Try Chat or Search to find data.')
  })

  it('should show loading message when loading', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.isLoading = true
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Loading entity details...')
  })

  it('should show no data message when not loading but no detail', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.isLoading = false
    mockEntityDetail.detail = null
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('alert-title')).toHaveTextContent('No data to view. Try Chat or Search to find data.')
  })

  it('should show error message when error occurs', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.isError = true
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Error loading entity details.')
  })

  it('should render entity details when data is available', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'subject1', t: 'uri' },
          p: { v: 'predicate1', t: 'uri' },
          o: { v: 'object1', t: 'literal' },
        },
        {
          s: { v: 'subject2', t: 'uri' },
          p: { v: 'predicate2', t: 'uri' },
          o: { v: 'object2', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('heading')).toHaveTextContent('Test Entity')
    expect(screen.getByTestId('entity-help')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toHaveTextContent('Graph view')
    expect(screen.getAllByTestId('element-node')).toHaveLength(6) // 3 nodes per triple * 2 triples
  })

  it('should navigate to graph view when button is clicked', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'subject1', t: 'uri' },
          p: { v: 'predicate1', t: 'uri' },
          o: { v: 'object1', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    const graphButton = screen.getByTestId('button')
    fireEvent.click(graphButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/graph')
  })

  it('should render triples with correct structure', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'subject1', t: 'uri' },
          p: { v: 'predicate1', t: 'uri' },
          o: { v: 'object1', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('stack')).toBeInTheDocument()
    expect(screen.getAllByTestId('arrow-big-right-icon')).toHaveLength(2) // 2 arrows per triple
    expect(screen.getAllByTestId('element-node')).toHaveLength(3) // subject, predicate, object
  })

  it('should handle empty triples array', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('heading')).toHaveTextContent('Test Entity')
    expect(screen.queryByTestId('stack')).not.toBeInTheDocument()
    expect(screen.queryByTestId('element-node')).not.toBeInTheDocument()
  })

  it('should handle multiple triples', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'subject1', t: 'uri' },
          p: { v: 'predicate1', t: 'uri' },
          o: { v: 'object1', t: 'literal' },
        },
        {
          s: { v: 'subject2', t: 'uri' },
          p: { v: 'predicate2', t: 'uri' },
          o: { v: 'object2', t: 'literal' },
        },
        {
          s: { v: 'subject3', t: 'uri' },
          p: { v: 'predicate3', t: 'uri' },
          o: { v: 'object3', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getAllByTestId('stack')).toHaveLength(3)
    expect(screen.getAllByTestId('arrow-big-right-icon')).toHaveLength(6) // 2 arrows per triple * 3 triples
    expect(screen.getAllByTestId('element-node')).toHaveLength(9) // 3 nodes per triple * 3 triples
  })

  it('should handle special characters in entity label', () => {
    mockWorkbenchState.selected = { 
      uri: 'test-uri', 
      label: 'Entity with special chars: !@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`' 
    }
    mockEntityDetail.detail = {
      triples: [],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('heading')).toHaveTextContent('Entity with special chars: !@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`')
  })

  it('should handle long entity label', () => {
    const longLabel = 'This is a very long entity label that should be handled correctly by the EntityDetail component. '.repeat(3)
    mockWorkbenchState.selected = { 
      uri: 'test-uri', 
      label: longLabel 
    }
    mockEntityDetail.detail = {
      triples: [],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('heading')).toHaveTextContent(longLabel)
  })

  it('should handle triples with complex values', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'http://example.com/subject/with/long/uri', t: 'uri' },
          p: { v: 'http://example.com/predicate', t: 'uri' },
          o: { v: 'Complex literal value with "quotes" and special chars!', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    const elementNodes = screen.getAllByTestId('element-node')
    expect(elementNodes[0]).toHaveTextContent('http://example.com/subject/with/long/uri (uri)')
    expect(elementNodes[1]).toHaveTextContent('http://example.com/predicate (uri)')
    expect(elementNodes[2]).toHaveTextContent('Complex literal value with "quotes" and special chars! (literal)')
  })

  it('should render with correct component hierarchy', () => {
    mockWorkbenchState.selected = { uri: 'test-uri', label: 'Test Entity' }
    mockEntityDetail.detail = {
      triples: [
        {
          s: { v: 'subject1', t: 'uri' },
          p: { v: 'predicate1', t: 'uri' },
          o: { v: 'object1', t: 'literal' },
        },
      ],
    }
    
    render(<EntityDetail />)
    
    expect(screen.getByTestId('hstack')).toBeInTheDocument()
    expect(screen.getByTestId('heading')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.getByTestId('entity-help')).toBeInTheDocument()
    expect(screen.getByTestId('rotate3d-icon')).toBeInTheDocument()
  })
})