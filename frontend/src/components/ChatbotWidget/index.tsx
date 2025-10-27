import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box,
  Fab,
  Drawer,
  IconButton,
  TextField,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Rating,
  Tooltip,
  Badge,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme as useMuiTheme,
  useMediaQuery,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ThumbUp as ThumbUpIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Article as ArticleIcon,
  Lightbulb as LightbulbIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  assistantService,
  ChatMessage,
  ChatConversation,
  QuickAction,
} from '../../services/assistantService';

// Declaración de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ChatbotWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'sidebar';
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  position = 'bottom-right',
}) => {
  const muiTheme = useMuiTheme();
  const { theme: appTheme } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{
    messageId: string;
    rating: number;
  } | null>(null);

  // Estados para reconocimiento de voz
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Estados para mostrar/ocultar secciones
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar sugerencias y acciones al abrir
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
      loadQuickActions();
    }
  }, [isOpen]);

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMobile]);

  // Configurar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as typeof window & { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition || (window as typeof window & { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputValue(finalTranscript);
          setTranscript('');
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        let message = 'Error en el reconocimiento de voz';

        switch (event?.error) {
          case 'not-allowed':
            message = 'Permite el acceso al micrófono en tu navegador para usar esta función.';
            break;
          case 'audio-capture':
            message = 'No encontramos un micrófono disponible. Verifica la conexión del dispositivo.';
            break;
          case 'no-speech':
            message = 'No se detectó audio. Habla más cerca del micrófono e inténtalo nuevamente.';
            break;
          case 'aborted':
            message = 'El reconocimiento de voz se detuvo. Intenta otra vez.';
            break;
          case 'network':
            message = 'No se pudo conectar al servicio de voz. Verifica tu conexión a internet.';
            break;
          default:
            if (event?.message) {
              message = event.message;
            }
            break;
        }

        setVoiceError(message);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTranscript('');
      };
    }
  }, []);

  const loadSuggestions = async () => {
    try {
      console.log('📥 Cargando sugerencias...');
      const data = await assistantService.getSuggestions();
      console.log('✅ Sugerencias cargadas:', data);
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      console.error('❌ Error loading suggestions:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const loadQuickActions = async () => {
    try {
      console.log('📥 Cargando acciones rápidas...');
      const data = await assistantService.getQuickActions();
      console.log('✅ Acciones rápidas cargadas:', data);
      setQuickActions(data.quick_actions || []);
    } catch (error: any) {
      console.error('❌ Error loading quick actions:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('📥 Cargando conversaciones...');
      const data = await assistantService.getConversations();
      console.log('✅ Conversaciones cargadas:', data);
      setConversations(data);
    } catch (error: any) {
      console.error('❌ Error loading conversations:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('📤 Enviando mensaje:', text);
      console.log('🔑 Token disponible:', !!localStorage.getItem('token'));
      const response = await assistantService.sendMessage(text, conversationId);
      console.log('✅ Respuesta recibida:', response);
      setConversationId(response.conversation_id);
      setMessages((prev) => [...prev, response.message]);
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data);
      console.error('Status code:', error.response?.status);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    sendMessage(suggestion);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('El reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setVoiceError(null);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setVoiceError('No se pudo iniciar el reconocimiento de voz. Intenta nuevamente.');
      }
    }
  };

  const handleRating = async (messageId: string, rating: number) => {
    try {
      await assistantService.sendFeedback(messageId, rating);
      setSelectedRating({ messageId, rating });
      setTimeout(() => setSelectedRating(null), 2000);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const conversation = await assistantService.getConversation(convId);
      setMessages(conversation.messages || []);
      setConversationId(convId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;

    const roleColors: Record<string, { bg: string; text: string; label: string }> = {
      admin: { bg: 'bg-darkAqua', text: 'text-white', label: 'Admin' },
      employee: { bg: 'bg-nectar', text: 'text-white', label: 'Cajero' },
      manager: { bg: 'bg-olive', text: 'text-white', label: 'Gerente' },
      customer: { bg: 'bg-slate', text: 'text-white', label: 'Cliente' },
    };

    const role = user.role || 'customer';
    const config = roleColors[role] || roleColors.customer;

    return (
      <Chip
        label={config.label}
        size="small"
        className={`${config.bg} ${config.text} font-medium`}
      />
    );
  };

  const drawerContent = (
    <Box
      className="h-full flex flex-col"
      sx={{
        width: isMobile ? '100vw' : 400,
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        className="flex items-center justify-between p-4 rounded-none"
        sx={{
          background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
          color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.text.primary,
        }}
      >
        <Box className="flex items-center gap-3">
          <Avatar
            src="/images/logo.jpg"
            alt="Asistente"
            sx={{ 
              width: 48, 
              height: 48, 
              border: `2px solid ${muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.background.paper}` 
            }}
          />
          <Box>
            <Typography variant="h6" className="font-bold">
              Asistente Virtual
            </Typography>
            <Typography variant="caption" className="opacity-90">
              Siempre listo para ayudar
            </Typography>
          </Box>
        </Box>
        <Box className="flex items-center gap-2">
          {getRoleBadge()}
          <Tooltip title="Historial">
            <IconButton
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) loadConversations();
              }}
              sx={{ color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : 'inherit' }}
            >
              <Badge badgeContent={conversations.length} color="error">
                <HistoryIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setIsOpen(false)} sx={{ color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* History Panel */}
      <Collapse in={showHistory}>
        <Box
          sx={{
            maxHeight: '40vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Paper className="p-3 m-3 rounded-lg" elevation={2}>
            <Box className="flex items-center justify-between mb-2">
              <Typography variant="subtitle2" className="font-bold text-slate">
                Conversaciones Recientes
              </Typography>
              <Button
                size="small"
                onClick={startNewConversation}
                className="text-darkAqua"
              >
                Nueva
              </Button>
            </Box>
            <Divider className="my-2" />
            <List dense>
              {conversations.length === 0 ? (
                <Typography variant="body2" className="text-gray-500 text-center py-4">
                  No hay conversaciones previas
                </Typography>
              ) : (
                conversations.map((conv) => (
                  <ListItem key={conv.id} disablePadding>
                    <ListItemButton
                      onClick={() => loadConversation(conv.id)}
                      selected={conv.id === conversationId}
                      className="rounded-lg"
                    >
                      <ListItemText
                        primary={conv.title}
                        secondary={`${conv.message_count} mensajes`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          className: 'font-medium truncate',
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>
      </Collapse>

      {/* Quick Actions */}
      {quickActions.length > 0 && messages.length === 0 && (
        <Paper className="m-3 p-3 rounded-lg" elevation={2}>
          <Box className="flex items-center justify-between mb-2">
            <Typography
              variant="caption"
              className="font-semibold text-slate uppercase"
            >
              Acciones Rápidas
            </Typography>
            <Button
              size="small"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-xs text-darkAqua"
            >
              {showQuickActions ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Box>
          <Collapse in={showQuickActions}>
            <Box className="grid grid-cols-2 gap-2 mt-2">
              {quickActions.slice(0, 4).map((action, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  href={action.url}
                  className="text-xs normal-case border-nectar text-nectar hover:bg-nectar hover:bg-opacity-10"
                  startIcon={<OpenInNewIcon fontSize="small" />}
                >
                  <span className="truncate">{action.label.replace(/[📦💰📊👥]/g, '')}</span>
                </Button>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Messages */}
      <Box className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <Box className="text-center mt-12">
            <BotIcon sx={{ fontSize: 80, color: '#488a99', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" className="font-bold text-slate mb-2">
              ¡Hola! ¿En qué puedo ayudarte?
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Pregunta cualquier cosa sobre el sistema
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Paper
                elevation={2}
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? ''
                    : 'bg-white border border-gray-200'
                }`}
                sx={{
                  ...(msg.role === 'user' && {
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                    color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                  }),
                }}
              >
                {/* Avatar */}
                <Box className="flex items-start gap-2 mb-2">
                  {msg.role === 'assistant' && (
                    <Avatar
                      src="/images/logo.jpg"
                      sx={{ width: 24, height: 24 }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    className={`font-semibold ${
                      msg.role === 'user' ? 'text-white' : 'text-slate'
                    }`}
                  >
                    {msg.role === 'user' ? 'Tú' : 'Asistente'}
                  </Typography>
                </Box>

                {/* Content */}
                {msg.role === 'assistant' ? (
                  <Box
                    sx={{
                      '& h1, & h2, & h3': {
                        fontWeight: 'bold',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem',
                      },
                      '& h2': { fontSize: '1.25rem' },
                      '& h3': { fontSize: '1.1rem' },
                      '& p': { marginBottom: '0.5rem' },
                      '& ul, & ol': {
                        marginLeft: '1.5rem',
                        marginBottom: '0.5rem',
                      },
                      '& li': { marginBottom: '0.25rem' },
                      '& strong': { fontWeight: 'bold' },
                      '& em': { fontStyle: 'italic' },
                      '& code': {
                        backgroundColor: '#f5f5f5',
                        padding: '0.125rem 0.25rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: '#f5f5f5',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        overflow: 'auto',
                        marginBottom: '0.5rem',
                      },
                      '& a': {
                        color: '#488a99',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    className="whitespace-pre-wrap"
                    sx={{
                      color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                    }}
                  >
                    {msg.content}
                  </Typography>
                )}

                {/* Suggested Actions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <Box className="mt-3 space-y-2">
                    {msg.suggested_actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="contained"
                        size="small"
                        fullWidth
                        href={action.url}
                        className="bg-white text-darkAqua hover:bg-gray-100 normal-case shadow-sm"
                        startIcon={<OpenInNewIcon fontSize="small" />}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Box>
                )}

                {/* Related Resources */}
                {msg.related_resources && msg.related_resources.length > 0 && (
                  <Box className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                    <Typography variant="caption" className="font-semibold opacity-70 block">
                      📚 Recursos:
                    </Typography>
                    {msg.related_resources.map((resource, idx) => (
                      <Button
                        key={idx}
                        variant="text"
                        size="small"
                        fullWidth
                        href={resource.url}
                        target="_blank"
                        className="bg-white bg-opacity-50 hover:bg-opacity-80 normal-case text-left justify-start"
                        startIcon={<ArticleIcon fontSize="small" />}
                      >
                        <Box>
                          <Typography variant="caption" className="font-medium block">
                            {resource.title}
                          </Typography>
                          <Typography variant="caption" className="opacity-70 block">
                            {resource.description}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Box>
                )}

                {/* Rating */}
                {msg.role === 'assistant' && (
                  <Box className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
                    <Typography variant="caption" className="text-gray-600">
                      ¿Te fue útil?
                    </Typography>
                    <Rating
                      size="small"
                      value={
                        selectedRating?.messageId === msg.id
                          ? selectedRating.rating
                          : 0
                      }
                      onChange={(_, value) => {
                        if (value) handleRating(msg.id, value);
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Box className="flex justify-start">
            <Paper elevation={2} className="bg-white p-3 rounded-2xl">
              <Box className="flex items-center gap-2">
                <CircularProgress size={16} className="text-darkAqua" />
                <Typography variant="body2" className="text-slate">
                  Escribiendo...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length === 0 && (
        <Paper className="mx-3 mb-2 p-3 rounded-lg" elevation={2}>
          <Box className="flex items-center justify-between mb-2">
            <Box className="flex items-center gap-1">
              <LightbulbIcon fontSize="small" className="text-nectar" />
              <Typography variant="caption" className="font-semibold text-slate">
                Sugerencias
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-darkAqua"
            >
              {showSuggestions ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Box>
          <Collapse in={showSuggestions}>
            <Box className="space-y-1 max-h-32 overflow-y-auto mt-2">
              {suggestions.slice(0, 4).map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs normal-case text-left justify-start border-gray-300 hover:bg-gray-50"
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Input */}
      <Paper
        elevation={4}
        className="p-3 rounded-none"
        sx={{ borderTop: '1px solid #e0e0e0' }}
      >
        {/* Error de voz */}
        {voiceError && (
          <Alert severity="error" className="mb-2" onClose={() => setVoiceError(null)}>
            {voiceError}
          </Alert>
        )}

        {/* Indicador de transcripción */}
        {transcript && (
          <Alert severity="info" className="mb-2">
            Escuchando: {transcript}...
          </Alert>
        )}

        <Box className="flex gap-2">
          <TextField
            fullWidth
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
            placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta o usa el micrófono..."}
            disabled={isLoading || isListening}
            inputRef={inputRef}
            className="bg-white"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                outline: 'none !important',
                '& fieldset': {
                  borderColor: '#CDAB81',
                  outline: 'none !important',
                },
                '&:hover fieldset': {
                  borderColor: '#488a99',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#488a99',
                  borderWidth: '1px',
                  outline: 'none !important',
                },
                '&.Mui-focused': {
                  outline: 'none !important',
                  boxShadow: 'none !important',
                },
              },
              '& .MuiInputBase-input': {
                outline: 'none !important',
                '&:focus': {
                  outline: 'none !important',
                },
              },
              '& input': {
                outline: 'none !important',
                '&:focus': {
                  outline: 'none !important',
                },
                '&:focus-visible': {
                  outline: 'none !important',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={isListening ? "Detener grabación" : "Grabar audio"}>
                    <IconButton
                      onClick={toggleListening}
                      disabled={isLoading}
                      size="small"
                      sx={{
                        color: isListening ? '#f44336' : '#488a99',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 },
                        },
                      }}
                    >
                      {isListening ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Enviar">
            <span>
              <IconButton
                onClick={() => sendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || isListening}
                sx={{
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                  color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                  '&:hover': {
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark || muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.dark || muiTheme.palette.secondary.main} 100%)`,
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Typography
          variant="caption"
          className="text-gray-400 text-center block mt-2"
        >
          Pulsa Enter para enviar • {isListening ? '🎙️ Grabando...' : '🎤 Click en el micrófono para voz'}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Tooltip title="Abrir Asistente Virtual" placement="left">
          <Fab
            onClick={() => setIsOpen(true)}
            className="shadow-2xl"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              zIndex: 1300,
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
              color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
              '&:hover': {
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark || muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.dark || muiTheme.palette.secondary.main} 100%)`,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Badge badgeContent="?" color="error">
              <ChatIcon sx={{ fontSize: 32 }} />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      {/* Drawer */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            height: isMobile ? '95vh' : '100vh',
            borderRadius: isMobile ? '16px 16px 0 0' : 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default ChatbotWidget;
