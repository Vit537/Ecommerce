import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic, MicOff } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  placeholder = 'Buscar productos...'
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "es-ES";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (finalTranscript) {
          setQuery(finalTranscript);
        } else {
          setQuery(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
        let message = "Error en el reconocimiento de voz";

        switch (event?.error) {
          case "not-allowed":
            message = "Permite el acceso al micrófono en tu navegador.";
            break;
          case "audio-capture":
            message = "No se encontró un micrófono disponible.";
            break;
          case "no-speech":
            message = "No se detectó audio. Habla más cerca del micrófono.";
            break;
          case "network":
            message = "Error de conexión. Verifica tu internet.";
            break;
        }

        setVoiceError(message);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceError(null);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center bg-white rounded-full shadow-sm border-2 transition-all ${
        isFocused ? 'border-black shadow-md' : 'border-gray-200'
      }`}>
        <Search className="ml-6 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 text-sm focus:outline-none bg-transparent"
        />
        
        {/* Botón de voz */}
        <button
          onClick={toggleListening}
          className={`p-2 mx-2 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={isListening ? "Detener grabación" : "Buscar por voz"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Botón limpiar */}
        {query && (
          <button
            onClick={handleClear}
            className="mr-4 p-1 hover:bg-gray-100 transition-colors rounded-full"
          >
            <X size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Error de voz */}
      {voiceError && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {voiceError}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
