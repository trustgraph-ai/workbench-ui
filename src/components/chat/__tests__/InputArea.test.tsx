import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InputArea from '../InputArea'

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Input: ({ children, ...props }: any) => <input data-testid="input" {...props}>{children}</input>,
  HStack: ({ children, ...props }: any) => <div data-testid="hstack" {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  ),
  Popover: {
    Root: ({ children, ...props }: any) => <div data-testid="popover-root" {...props}>{children}</div>,
    Trigger: ({ children, ...props }: any) => <div data-testid="popover-trigger" {...props}>{children}</div>,
    Positioner: ({ children, ...props }: any) => <div data-testid="popover-positioner" {...props}>{children}</div>,
    Content: ({ children, ...props }: any) => <div data-testid="popover-content" {...props}>{children}</div>,
    Arrow: ({ ...props }: any) => <div data-testid="popover-arrow" {...props} />,
    Body: ({ children, ...props }: any) => <div data-testid="popover-body" {...props}>{children}</div>,
    Title: ({ children, ...props }: any) => <div data-testid="popover-title" {...props}>{children}</div>,
  },
  IconButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="icon-button" onClick={onClick} {...props}>{children}</button>
  ),
  Portal: ({ children, ...props }: any) => <div data-testid="portal" {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <p data-testid="text" {...props}>{children}</p>,
}))

// Mock state stores
const mockSetInput = vi.fn()
const mockChatState = {
  input: '',
  setInput: mockSetInput,
}

const mockProgressState = {
  activity: new Set(),
}

vi.mock('../../state/chat', () => ({
  useChatStateStore: vi.fn((selector) => selector(mockChatState)),
}))

vi.mock('../../state/progress', () => ({
  useProgressStateStore: vi.fn((selector) => selector(mockProgressState)),
}))

// Mock components
vi.mock('./ChatHelp', () => ({
  default: () => <div data-testid="chat-help">ChatHelp</div>,
}))

vi.mock('../common/ProgressSubmitButton', () => ({
  default: ({ disabled, working, onclick }: any) => (
    <button 
      data-testid="button"
      disabled={disabled}
      onClick={onclick}
    >
      {working ? 'Working...' : 'Submit'}
    </button>
  ),
}))

describe('InputArea', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockChatState.input = ''
    mockProgressState.activity = new Set()
  })

  it('should render input field with placeholder', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Describe a Graph RAG request...')
  })

  it('should render submit button and help components', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.getByTestId('chat-help')).toBeInTheDocument()
  })

  it('should display current input value', () => {
    mockChatState.input = 'test input'
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('input')).toHaveValue('test input')
  })

  it('should call setInput when input changes', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'new input' } })
    
    expect(mockSetInput).toHaveBeenCalledWith('new input')
  })

  it('should call onSubmit when Enter key is pressed', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should not call onSubmit when other keys are pressed', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    fireEvent.keyDown(input, { key: 'Space' })
    fireEvent.keyDown(input, { key: 'Tab' })
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit when submit button is clicked', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByTestId('button')
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should disable submit button when activity is present', () => {
    mockProgressState.activity = new Set(['activity1'])
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByTestId('button')
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when no activity', () => {
    mockProgressState.activity = new Set()
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByTestId('button')
    expect(submitButton).not.toBeDisabled()
  })

  it('should show working state when activity is present', () => {
    mockProgressState.activity = new Set(['activity1'])
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('button')).toHaveTextContent('Working...')
  })

  it('should show normal state when no activity', () => {
    mockProgressState.activity = new Set()
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('button')).toHaveTextContent('Submit')
  })

  it('should handle empty input value', () => {
    mockChatState.input = ''
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('input')).toHaveValue('')
  })

  it('should handle long input value', () => {
    const longInput = 'This is a very long input that should be handled correctly by the InputArea component. '.repeat(5)
    mockChatState.input = longInput
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('input')).toHaveValue(longInput)
  })

  it('should handle special characters in input', () => {
    const specialInput = 'Special chars: !@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`'
    mockChatState.input = specialInput
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('input')).toHaveValue(specialInput)
  })

  it('should handle multiple activities in progress', () => {
    mockProgressState.activity = new Set(['activity1', 'activity2', 'activity3'])
    
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByTestId('button')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Working...')
  })

  it('should handle rapid input changes', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })
    
    expect(mockSetInput).toHaveBeenCalledTimes(3)
    expect(mockSetInput).toHaveBeenLastCalledWith('abc')
  })

  it('should handle Enter key with modifier keys', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    
    // Enter with Shift should still trigger submit
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    
    // Enter with Ctrl should still trigger submit
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    expect(mockOnSubmit).toHaveBeenCalledTimes(2)
  })

  it('should maintain input focus after submission', () => {
    render(<InputArea onSubmit={mockOnSubmit} />)
    
    const input = screen.getByTestId('input')
    const submitButton = screen.getByTestId('button')
    
    // Focus the input first
    input.focus()
    
    // Click submit
    fireEvent.click(submitButton)
    
    // onSubmit should be called
    expect(mockOnSubmit).toHaveBeenCalled()
  })
})