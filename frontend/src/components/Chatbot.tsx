import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  Divider,
  useTheme,
  CircularProgress,
  Fab,
  Zoom,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { sendMessageToAI } from '../services/chatbot';
import { useAuth } from '../hooks/useAuth';

type MessageRole = 'user' | 'bot';

interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

interface ChatbotProps {
  initialMessages?: ChatMessage[];
  botName?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  avatarSrc?: string;
  initiallyOpen?: boolean;
}

function FloatingChatbot({
  initialMessages = [],
  botName = 'AI Assistant',
  placeholder = 'Type your message...',
  width = 320,
  height = 450,
  avatarSrc,
  initiallyOpen = false,
}: ChatbotProps) {
  const { clubName, ageGroup, division } = useAuth() ?? { clubName: '', ageGroup: '', division: '' };
  const [isOpen, setIsOpen] = useState<boolean>(initiallyOpen);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToAI(inputValue, clubName ?? '', ageGroup ?? '', division ?? '');
      console.log('Bot response:', botResponse);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        role: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again later.',
          role: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={handleToggle}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      <Zoom in={isOpen}>
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width,
            height,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1200,
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{botName}</Typography>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: theme.palette.background.default }}>
            <Fade in>
              <List>
                {messages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    Start asking your questions...
                  </Typography>
                ) : (
                  messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                        px: 0
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '85%' }}>
                        {message.role === 'bot' && (
                          <Avatar
                            sx={{
                              mr: 1,
                              width: 28,
                              height: 28
                            }}
                            src={avatarSrc}
                          >
                            {!avatarSrc && <SmartToyIcon fontSize="small" />}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor:
                              message.role === 'user'
                                ? theme.palette.primary.main
                                : theme.palette.background.paper,
                            color:
                              message.role === 'user'
                                ? theme.palette.primary.contrastText
                                : theme.palette.text.primary,
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              fontSize: '0.7rem',
                              color:
                                message.role === 'user'
                                  ? 'rgba(255,255,255,0.7)'
                                  : theme.palette.text.secondary,
                              textAlign: 'right'
                            }}
                          >
                            {formatTimestamp(message.timestamp)}
                          </Typography>
                        </Box>
                        {message.role === 'user' && (
                          <Avatar sx={{ ml: 1, width: 28, height: 28 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    </ListItem>
                  ))
                )}
                {isLoading && (
                  <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', px: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: 1
                      }}
                    >
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="body2">Thinking...</Typography>
                    </Box>
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Fade>
          </Box>
          <Divider />
          <Box sx={{ p: 1.5, bgcolor: theme.palette.background.paper, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              disabled={isLoading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { bgcolor: theme.palette.primary.dark }
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
}

export default FloatingChatbot;
