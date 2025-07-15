import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Documents from '../Documents'

// Mock @tanstack/react-table
const mockTable = {
  getSelectedRowModel: vi.fn(() => ({
    rows: [],
  })),
  setRowSelection: vi.fn(),
}

vi.mock('@tanstack/react-table', () => ({
  getCoreRowModel: vi.fn(() => 'mockCoreRowModel'),
  useReactTable: vi.fn(() => mockTable),
}))

// Mock document table columns
vi.mock('../../../model/document-table', () => ({
  columns: [
    { id: 'name', accessorKey: 'name', header: 'Name' },
    { id: 'size', accessorKey: 'size', header: 'Size' },
  ],
}))

// Mock state hooks
const mockLibrary = {
  documents: [],
  deleteDocuments: vi.fn(),
  submitDocuments: vi.fn(),
}

const mockNotify = {
  info: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}

vi.mock('../../state/library.ts', () => ({
  useLibrary: vi.fn(() => mockLibrary),
}))

vi.mock('../../state/notify.ts', () => ({
  useNotification: vi.fn(() => mockNotify),
}))

// Mock child components
vi.mock('../Actions', () => ({
  default: ({ selectedCount, onSubmit, onEdit, onDelete }: any) => (
    <div data-testid="actions">
      <span data-testid="selected-count">{selectedCount}</span>
      <button data-testid="submit-action" onClick={onSubmit}>Submit</button>
      <button data-testid="edit-action" onClick={onEdit}>Edit</button>
      <button data-testid="delete-action" onClick={onDelete}>Delete</button>
    </div>
  ),
}))

vi.mock('../SubmitDialog', () => ({
  default: ({ open, onOpenChange, onSubmit, docs }: any) => (
    <div data-testid="submit-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button data-testid="close-submit-dialog" onClick={() => onOpenChange(false)}>Close</button>
      <button data-testid="confirm-submit" onClick={() => onSubmit('test-flow', ['tag1'])}>Confirm</button>
      <span data-testid="docs-count">{docs.length}</span>
    </div>
  ),
}))

vi.mock('../../common/SelectableTable', () => ({
  default: ({ table }: any) => (
    <div data-testid="selectable-table">
      <span data-testid="table-data">{JSON.stringify(table.data || [])}</span>
    </div>
  ),
}))

vi.mock('../DocumentControls', () => ({
  default: ({ onUpload }: any) => (
    <div data-testid="document-controls">
      <button data-testid="upload-button" onClick={onUpload}>Upload</button>
    </div>
  ),
}))

vi.mock('../../load/UploadDialog', () => ({
  default: ({ open, onOpenChange }: any) => (
    <div data-testid="upload-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button data-testid="close-upload-dialog" onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}))

describe('Documents', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockLibrary.documents = []
    mockTable.getSelectedRowModel.mockReturnValue({ rows: [] })
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should render all main components', () => {
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('actions')).toBeInTheDocument()
    expect(screen.getByTestId('submit-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('upload-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('selectable-table')).toBeInTheDocument()
    expect(screen.getByTestId('document-controls')).toBeInTheDocument()
  })

  it('should handle empty documents array', () => {
    mockLibrary.documents = []
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0')
    expect(screen.getByTestId('table-data')).toHaveTextContent('[]')
  })

  it('should handle documents array with data', () => {
    const mockDocs = [
      { id: '1', name: 'doc1.pdf', size: 1024 },
      { id: '2', name: 'doc2.pdf', size: 2048 },
    ]
    mockLibrary.documents = mockDocs
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(mockDocs))
  })

  it('should handle undefined documents (fallback to empty array)', () => {
    mockLibrary.documents = undefined
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('table-data')).toHaveTextContent('[]')
  })

  it('should show selected count correctly', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
      { original: { id: '2', name: 'doc2.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('selected-count')).toHaveTextContent('2')
  })

  it('should open submit dialog when submit action is clicked', () => {
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('submit-dialog')).toHaveStyle({ display: 'none' })
    
    fireEvent.click(screen.getByTestId('submit-action'))
    
    expect(screen.getByTestId('submit-dialog')).toHaveStyle({ display: 'block' })
  })

  it('should close submit dialog when close button is clicked', () => {
    renderWithQueryClient(<Documents />)
    
    // Open dialog first
    fireEvent.click(screen.getByTestId('submit-action'))
    expect(screen.getByTestId('submit-dialog')).toHaveStyle({ display: 'block' })
    
    // Close dialog
    fireEvent.click(screen.getByTestId('close-submit-dialog'))
    expect(screen.getByTestId('submit-dialog')).toHaveStyle({ display: 'none' })
  })

  it('should open upload dialog when upload button is clicked', () => {
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('upload-dialog')).toHaveStyle({ display: 'none' })
    
    fireEvent.click(screen.getByTestId('upload-button'))
    
    expect(screen.getByTestId('upload-dialog')).toHaveStyle({ display: 'block' })
  })

  it('should close upload dialog when close button is clicked', () => {
    renderWithQueryClient(<Documents />)
    
    // Open dialog first
    fireEvent.click(screen.getByTestId('upload-button'))
    expect(screen.getByTestId('upload-dialog')).toHaveStyle({ display: 'block' })
    
    // Close dialog
    fireEvent.click(screen.getByTestId('close-upload-dialog'))
    expect(screen.getByTestId('upload-dialog')).toHaveStyle({ display: 'none' })
  })

  it('should call deleteDocuments when delete action is clicked', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
      { original: { id: '2', name: 'doc2.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    fireEvent.click(screen.getByTestId('delete-action'))
    
    expect(mockLibrary.deleteDocuments).toHaveBeenCalledWith({
      ids: ['1', '2'],
      onSuccess: expect.any(Function),
    })
  })

  it('should call submitDocuments when submit is confirmed', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
      { original: { id: '2', name: 'doc2.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    // Open submit dialog
    fireEvent.click(screen.getByTestId('submit-action'))
    
    // Confirm submit
    fireEvent.click(screen.getByTestId('confirm-submit'))
    
    expect(mockLibrary.submitDocuments).toHaveBeenCalledWith({
      ids: ['1', '2'],
      flow: 'test-flow',
      tags: ['tag1'],
      onSuccess: expect.any(Function),
    })
  })

  it('should show "Not implemented" notification when edit is clicked', () => {
    renderWithQueryClient(<Documents />)
    
    fireEvent.click(screen.getByTestId('edit-action'))
    
    expect(mockNotify.info).toHaveBeenCalledWith('Not implemented')
  })

  it('should clear row selection on successful deletion', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    fireEvent.click(screen.getByTestId('delete-action'))
    
    // Get the onSuccess callback and call it
    const deleteCall = mockLibrary.deleteDocuments.mock.calls[0][0]
    deleteCall.onSuccess()
    
    expect(mockTable.setRowSelection).toHaveBeenCalledWith({})
  })

  it('should clear row selection and close dialog on successful submission', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    // Open submit dialog
    fireEvent.click(screen.getByTestId('submit-action'))
    
    // Confirm submit
    fireEvent.click(screen.getByTestId('confirm-submit'))
    
    // Get the onSuccess callback and call it
    const submitCall = mockLibrary.submitDocuments.mock.calls[0][0]
    submitCall.onSuccess()
    
    expect(mockTable.setRowSelection).toHaveBeenCalledWith({})
    expect(screen.getByTestId('submit-dialog')).toHaveStyle({ display: 'none' })
  })

  it('should pass correct docs to submit dialog', () => {
    const selectedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
      { original: { id: '2', name: 'doc2.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: selectedRows })
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('docs-count')).toHaveTextContent('2')
  })

  it('should handle no selected documents', () => {
    mockTable.getSelectedRowModel.mockReturnValue({ rows: [] })
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0')
    expect(screen.getByTestId('docs-count')).toHaveTextContent('0')
  })

  it('should handle large number of documents', () => {
    const largeDocs = Array.from({ length: 100 }, (_, i) => ({
      id: `doc-${i}`,
      name: `document-${i}.pdf`,
      size: 1024 * (i + 1),
    }))
    mockLibrary.documents = largeDocs
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(largeDocs))
  })

  it('should handle documents with special characters', () => {
    const specialDocs = [
      { id: '1', name: 'doc with spaces.pdf', size: 1024 },
      { id: '2', name: 'doc-with-special-chars!@#$%^&*().pdf', size: 2048 },
    ]
    mockLibrary.documents = specialDocs
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(specialDocs))
  })

  it('should handle mixed selection states', () => {
    const mixedRows = [
      { original: { id: '1', name: 'doc1.pdf' } },
      { original: { id: '3', name: 'doc3.pdf' } },
      { original: { id: '5', name: 'doc5.pdf' } },
    ]
    mockTable.getSelectedRowModel.mockReturnValue({ rows: mixedRows })
    
    renderWithQueryClient(<Documents />)
    
    expect(screen.getByTestId('selected-count')).toHaveTextContent('3')
    
    fireEvent.click(screen.getByTestId('delete-action'))
    
    expect(mockLibrary.deleteDocuments).toHaveBeenCalledWith({
      ids: ['1', '3', '5'],
      onSuccess: expect.any(Function),
    })
  })
})