import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatWidget from './ChatWidget';

// Mock the AI service
vi.mock('../../lib/aiService', () => ({
  callAssistant: vi.fn(),
}));

import { callAssistant } from '../../lib/aiService';

// Mock VoiceInput component
vi.mock('./VoiceInput', () => ({
  default: ({ onSpeechResult }) => (
    <button type="button" data-testid="mock-voice-btn" onClick={() => onSpeechResult('Voice query test')}>
      Voice
    </button>
  ),
}));

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a closed widget button initially', () => {
    render(<ChatWidget context={{}} />);
    const openBtn = screen.getByLabelText(/Open AI Assistant/i);
    expect(openBtn).toBeDefined();
    
    // Because panel is hidden via CSS transform/opacity, the input is still in the DOM conceptually,
    // but the panel has aria-hidden
    const panel = screen.getByLabelText(/Ask OmniFlow/i).closest('div[aria-hidden]');
    expect(panel?.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens panel and handles text query submission', async () => {
    callAssistant.mockResolvedValueOnce('I am not busy right now.');

    render(<ChatWidget context={{ zone: 'A' }} />);
    
    // Open widget
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));

    const input = screen.getByLabelText(/Ask OmniFlow/i);
    expect(input).toBeDefined();

    // Type query
    fireEvent.change(input, { target: { value: 'How is the crowd?' } });
    
    // Submit
    const sendBtn = screen.getByLabelText(/Send message/i);
    fireEvent.click(sendBtn);

    // Verify loading state triggers UI
    expect(screen.getByText('How is the crowd?')).toBeDefined();
    
    await waitFor(() => {
      expect(callAssistant).toHaveBeenCalledWith('How is the crowd?', { zone: 'A' });
      expect(screen.getByText('I am not busy right now.')).toBeDefined();
    });
  });

  it('opens panel via Ctrl+/ shortcut', () => {
    render(<ChatWidget context={{}} />);
    
    // Simulate Ctrl+/
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    
    const panel = screen.getByLabelText(/Ask OmniFlow/i).closest('div[aria-hidden]');
    expect(panel?.getAttribute('aria-hidden')).toBe('false');
  });

  it('receives voice input and auto-submits', async () => {
    callAssistant.mockResolvedValueOnce('Voice response received.');
    render(<ChatWidget context={{}} />);
    
    // Open widget
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));

    const voiceBtn = screen.getByTestId('mock-voice-btn');
    fireEvent.click(voiceBtn);

    // Verify it appeared in chat
    expect(screen.getByText('Voice query test')).toBeDefined();

    await waitFor(() => {
      expect(callAssistant).toHaveBeenCalledWith('Voice query test', {});
      expect(screen.getByText('Voice response received.')).toBeDefined();
    });
  });

  it('displays error message if AI service fails', async () => {
     callAssistant.mockRejectedValueOnce(new Error('Rate limit exceeded'));
     render(<ChatWidget context={{}} />);
     fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
     fireEvent.change(screen.getByLabelText(/Ask OmniFlow/i), { target: { value: 'Bad query' } });
     fireEvent.click(screen.getByLabelText(/Send message/i));

     await waitFor(() => {
       expect(screen.getByText(/Rate limit exceeded/i)).toBeDefined();
     });
  });
});
