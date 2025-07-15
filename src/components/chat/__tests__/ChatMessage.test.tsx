import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from '../ChatMessage'

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: any) => <div data-testid="flex" {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <p data-testid="text" {...props}>{children}</p>,
  Avatar: {
    Root: ({ children, ...props }: any) => <div data-testid="avatar-root" {...props}>{children}</div>,
    Fallback: ({ name, ...props }: any) => <div data-testid="avatar-fallback" {...props}>{name}</div>,
  },
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}))

// Mock react-markdown-it
vi.mock('react-markdown-it', () => ({
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
}))

describe('ChatMessage', () => {
  it('should render user message with correct styling', () => {
    const message = {
      role: 'human',
      text: 'Hello, how are you?',
      type: 'normal'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('Hello, how are you?')
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('User')
  })

  it('should render AI message with correct styling', () => {
    const message = {
      role: 'ai',
      text: 'I am doing well, thank you!',
      type: 'normal'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('I am doing well, thank you!')
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('Bot')
  })

  it('should render thinking message with correct badge and icon', () => {
    const message = {
      role: 'ai',
      text: 'Let me think about this...',
      type: 'thinking'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toHaveTextContent('Thinking')
    expect(screen.getByTestId('markdown')).toHaveTextContent('Let me think about this...')
  })

  it('should render observation message with correct badge and icon', () => {
    const message = {
      role: 'ai',
      text: 'I observe that...',
      type: 'observation'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toHaveTextContent('Observation')
    expect(screen.getByTestId('markdown')).toHaveTextContent('I observe that...')
  })

  it('should render answer message with correct badge and icon', () => {
    const message = {
      role: 'ai',
      text: 'The answer is 42.',
      type: 'answer'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toHaveTextContent('Answer')
    expect(screen.getByTestId('markdown')).toHaveTextContent('The answer is 42.')
  })

  it('should handle message without type (defaults to normal)', () => {
    const message = {
      role: 'ai',
      text: 'Regular message'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('Regular message')
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
  })

  it('should handle empty message text', () => {
    const message = {
      role: 'human',
      text: '',
      type: 'normal'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('')
  })

  it('should handle markdown content', () => {
    const message = {
      role: 'ai',
      text: '**Bold text** and *italic text*',
      type: 'normal'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('**Bold text** and *italic text*')
  })


  it('should differentiate between user and AI avatar placement', () => {
    const userMessage = {
      role: 'human',
      text: 'User message',
      type: 'normal'
    }
    
    const { rerender } = render(<ChatMessage message={userMessage} />)
    
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('User')
    
    const aiMessage = {
      role: 'ai',
      text: 'AI message',
      type: 'normal'
    }
    
    rerender(<ChatMessage message={aiMessage} />)
    
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('Bot')
  })

  it('should handle all message types with correct styling', () => {
    const messageTypes = ['normal', 'thinking', 'observation', 'answer']
    
    messageTypes.forEach(type => {
      const message = {
        role: 'ai',
        text: `Message of type ${type}`,
        type: type
      }
      
      const { unmount } = render(<ChatMessage message={message} />)
      
      expect(screen.getByTestId('markdown')).toHaveTextContent(`Message of type ${type}`)
      
      if (type !== 'normal') {
        expect(screen.getByTestId('badge')).toBeInTheDocument()
      }
      
      unmount()
    })
  })

  it('should handle unknown message type (falls back to normal)', () => {
    const message = {
      role: 'ai',
      text: 'Unknown type message',
      type: 'unknown'
    }
    
    render(<ChatMessage message={message} />)
    
    expect(screen.getByTestId('markdown')).toHaveTextContent('Unknown type message')
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
  })

})