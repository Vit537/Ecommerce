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
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
  Article as ArticleIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/auth-context';
import {
  assistantService,
  ChatMessage,
  ChatConversation,
  QuickAction,
} from '@/services/assistantService';

interface ChatbotWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'sidebar';
}

// Helper to extract error details without using 'any'
function getErrorInfo(error: unknown): { message: string; status?: number; data?: unknown } {
  if (typeof error === 'object' && error !== null) {
    const e = error as { message?: string; response?: { status?: number; data?: unknown } };
    return {
      message: e.message || 'Error',
      status: e.response?.status,
      data: e.response?.data,
    };
  }
  return { message: String(error) };
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ position = 'bottom-right' }) => {
  const muiTheme = useMuiTheme();
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
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

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
  }, [isOpen, suggestions.length]);

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMobile]);

  const loadSuggestions = async () => {
    try {
      console.log('📥 Cargando sugerencias...');
      const data = await assistantService.getSuggestions();
      console.log('✅ Sugerencias cargadas:', data);
      setSuggestions(data.suggestions || []);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('❌ Error loading suggestions:', info.message, info.data);
    }
  };

  const loadQuickActions = async () => {
    try {
      console.log('📥 Cargando acciones rápidas...');
      const data = await assistantService.getQuickActions();
      console.log('✅ Acciones rápidas cargadas:', data);
      setQuickActions(data.quick_actions || []);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('❌ Error loading quick actions:', info.message, info.data);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('📥 Cargando conversaciones...');
      const data = await assistantService.getConversations();
      console.log('✅ Conversaciones cargadas:', data);
      setConversations(data);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('❌ Error loading conversations:', info.message, info.data);
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
  const response = await assistantService.sendMessage(text, conversationId || undefined);
      console.log('✅ Respuesta recibida:', response);
      setConversationId(response.conversation_id);
      setMessages((prev) => [...prev, response.message]);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('❌ Error sending message:', info.message, info.status, info.data);
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

  const handleRating = async (messageId: string, rating: number) => {
    try {
      await assistantService.sendFeedback(messageId, rating);
      setSelectedRating({ messageId, rating });
      setTimeout(() => setSelectedRating(null), 2000);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('Error sending feedback:', info.message, info.data);
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const conversation = await assistantService.getConversation(convId);
      setMessages(conversation.messages || []);
      setConversationId(convId);
      setShowHistory(false);
    } catch (error: unknown) {
      const info = getErrorInfo(error);
      console.error('Error loading conversation:', info.message, info.data);
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
        px: 2,
        py: 1,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        className="flex items-center justify-between rounded-none"
        sx={{
          background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
          color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.text.primary,
          px: 2.5,
          py: 2,
        }}
      >
        <Box className="flex items-center gap-3">
          <Avatar
            src={(user?.tenant_logo_square || user?.tenant_logo) ?? '/images/logo.jpg'}
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
      </Collapse>

      {/* Quick Actions */}
      {quickActions.length > 0 && messages.length === 0 && (
        <Paper className="m-3 p-3 rounded-lg" elevation={2}>
          <Typography
            variant="caption"
            className="font-semibold text-slate uppercase mb-2 block"
          >
            Acciones Rápidas
          </Typography>
          <Box className="grid grid-cols-2 gap-2">
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
        </Paper>
      )}

      {/* Messages */}
  <Box className="flex-1 overflow-y-auto p-6 space-y-4">
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
                elevation={msg.role === 'user' ? 2 : 0}
                className={`max-w-[85%] rounded-2xl ${
                  msg.role === 'user'
                    ? ''
                    : 'bg-white'
                }`}
                sx={{
                  p: 2.5,
                  border: msg.role === 'assistant' ? '1px solid' : undefined,
                  borderColor: msg.role === 'assistant' ? 'divider' : undefined,
                  ...(msg.role === 'user' && {
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                    color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                  }),
                  ...(msg.role === 'assistant' && {
                    backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f7f7f8',
                  })
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
                {msg.role === 'user' ? (
                  <Typography
                    variant="body2"
                    className={`whitespace-pre-wrap ${
                      msg.role === 'user' ? '' : 'text-gray-800'
                    }`}
                    sx={{
                      ...(msg.role === 'user' && {
                        color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                      }),
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </Typography>
                ) : (
                  <Box>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: (props) => <Typography variant="h6" className="font-bold mt-1 mb-1" {...props} />,
                        h2: (props) => <Typography variant="subtitle1" className="font-bold mt-2 mb-1" {...props} />,
                        h3: (props) => <Typography variant="subtitle2" className="font-semibold mt-2 mb-1" {...props} />,
                        p: (props) => <Typography variant="body2" className="text-gray-800" sx={{ lineHeight: 1.7, mb: 1 }} {...props} />,
                        li: (props) => <li className="ml-4"><Typography variant="body2" className="text-gray-800" sx={{ lineHeight: 1.6 }} component="span" {...props} /></li>,
                        ul: (props) => <ul className="list-disc pl-5 my-1" {...props} />,
                        ol: (props) => <ol className="list-decimal pl-5 my-1" {...props} />,
                        strong: (props) => <strong className="font-semibold" {...props} />,
                        a: (props) => <a className="text-darkAqua underline" target="_blank" rel="noreferrer" {...props} />,
                        blockquote: (props) => <blockquote className="border-l-4 border-gray-300 pl-3 my-2 italic" {...props} />,
                      }}
                    >
                      {expandedMessages[msg.id] || (msg.content?.length ?? 0) <= 600
                        ? msg.content
                        : `${msg.content.slice(0, 600)}...`}
                    </ReactMarkdown>
                    {(msg.content?.length ?? 0) > 600 && (
                      <Button
                        size="small"
                        onClick={() =>
                          setExpandedMessages((prev) => ({
                            ...prev,
                            [msg.id]: !prev[msg.id],
                          }))
                        }
                        className="normal-case mt-1 text-nectar"
                      >
                        {expandedMessages[msg.id] ? 'Mostrar menos' : 'Mostrar más'}
                      </Button>
                    )}
                  </Box>
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
          <Box className="flex items-center gap-1 mb-2">
            <LightbulbIcon fontSize="small" className="text-nectar" />
            <Typography variant="caption" className="font-semibold text-slate">
              Sugerencias:
            </Typography>
          </Box>
          <Box className="space-y-1 max-h-24 overflow-y-auto">
            {suggestions.slice(0, 3).map((suggestion, idx) => (
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
        </Paper>
      )}

      {/* Input */}
      <Paper
        elevation={4}
        className="p-3 rounded-none"
        sx={{ borderTop: '1px solid #e0e0e0' }}
      >
        <TextField
          fullWidth
          size="medium"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(inputValue);
            }
          }}
          placeholder="Escribe tu pregunta..."
          disabled={isLoading}
          inputRef={inputRef}
          className="bg-white"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Enviar">
                  <span>
                    <IconButton
                      onClick={() => sendMessage(inputValue)}
                      disabled={isLoading || !inputValue.trim()}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '999px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
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
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              paddingRight: 1,
              '& fieldset': {
                borderColor: '#CDAB81',
              },
              '&:hover fieldset': {
                borderColor: '#488a99',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#488a99',
              },
            },
          }}
        />
        <Typography
          variant="caption"
          className="text-gray-400 text-center block mt-2"
        >
          Pulsa Enter para enviar
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
              right: position === 'bottom-right' ? 24 : undefined,
              left: position === 'bottom-left' ? 24 : undefined,
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
