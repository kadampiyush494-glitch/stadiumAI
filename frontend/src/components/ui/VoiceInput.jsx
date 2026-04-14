import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import PropTypes from 'prop-types';

export default function VoiceInput({ onSpeechResult }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onSpeechResult) {
          onSpeechResult(transcript);
        }
      };

      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('Web Speech API is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSpeechResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        className={`p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'}`}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      
      {/* Visual waveform animation */}
      {isListening && (
        <div className="absolute -top-6 flex space-x-1 items-end h-4" aria-hidden="true">
           <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_0ms]" style={{ height: '60%' }}></div>
           <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_200ms]" style={{ height: '100%' }}></div>
           <div className="w-1 bg-red-400 animate-[bounce_1s_infinite_400ms]" style={{ height: '80%' }}></div>
        </div>
      )}
      
      {error && <span className="sr-only">Voice error: {error}</span>}
    </div>
  );
}

VoiceInput.propTypes = {
  onSpeechResult: PropTypes.func.isRequired,
};
