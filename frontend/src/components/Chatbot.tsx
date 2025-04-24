import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { sendMessageToAI } from "../services/chatbot";
import { useAuth } from "../hooks/useAuth";

type MessageRole = "user" | "bot";

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
  botName = "AI Assistant",
  placeholder = "Type your message...",
  width = 320,
  height = 450,
  avatarSrc,
  initiallyOpen = false,
}: ChatbotProps) {
  const { clubName, ageGroup, division } = useAuth() ?? {
    clubName: "",
    ageGroup: "",
    division: "",
  };
  const [isOpen, setIsOpen] = useState<boolean>(initiallyOpen);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const inputMaxLength = 500;

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (inputValue.length > inputMaxLength) {
      setErrorMessage(`Message too long. Maximum ${inputMaxLength} characters allowed.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToAI(
        inputValue,
        clubName ?? "",
        ageGroup ?? "",
        division ?? ""
      );
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse || "Sorry, I couldn't process your request at this time.",
        role: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting bot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I encountered an error. Please try again later.",
          role: "bot",
          timestamp: new Date(),
        },
      ]);
      setErrorMessage("Failed to connect to the AI service. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  // Input validation - prevent pasting excessive text
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (inputValue.length + pastedText.length > inputMaxLength) {
      e.preventDefault();
      setErrorMessage(`Pasted text too long. Message would exceed ${inputMaxLength} characters.`);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={handleToggle}
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1300 }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      <Zoom in={isOpen}>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width,
            height,
            display: "flex",
            flexDirection: "column",
            zIndex: 1200,
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
            }}
          >
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{botName}</Typography>
          </Box>
          <Divider />
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: theme.palette.background.default,
            }}
          >
            <Fade in>
              <List>
                {messages.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 2 }}
                  >
                    Start asking your questions...
                  </Typography>
                ) : (
                  messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          message.role === "user" ? "flex-end" : "flex-start",
                        mb: 2,
                        px: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          maxWidth: "85%",
                        }}
                      >
                        {message.role === "bot" && (
                          <Avatar
                            sx={{
                              mr: 1,
                              width: 28,
                              height: 28,
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
                              message.role === "user"
                                ? theme.palette.primary.main
                                : theme.palette.background.paper,
                            color:
                              message.role === "user"
                                ? theme.palette.primary.contrastText
                                : theme.palette.text.primary,
                            boxShadow: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              fontSize: "0.7rem",
                              color:
                                message.role === "user"
                                  ? "rgba(255,255,255,0.7)"
                                  : theme.palette.text.secondary,
                              display: "block",
                              textAlign: "right",
                            }}
                          >
                            {formatTimestamp(message.timestamp)}
                          </Typography>
                        </Box>
                        {message.role === "user" && (
                          <Avatar
                            sx={{
                              ml: 1,
                              width: 28,
                              height: 28,
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    </ListItem>
                  ))
                )}
                <div ref={messagesEndRef} />
              </List>
            </Fade>
          </Box>
          <Divider />
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              multiline
              maxRows={3}
              size="small"
              disabled={isLoading}
              inputProps={{ maxLength: inputMaxLength }}
              helperText={inputValue.length > 0 ? `${inputValue.length}/${inputMaxLength}` : ""}
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: "background.default",
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              sx={{ ml: 1 }}
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Zoom>
      
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// Wrap in error boundary to catch any unexpected rendering errors
class ChatbotErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Chatbot error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Fab
          color="primary"
          onClick={() => this.setState({ hasError: false })}
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1300 }}
        >
          <ChatIcon />
        </Fab>
      );
    }

    return this.props.children;
  }
}

export default function Chatbot(props: ChatbotProps) {
  return (
    <ChatbotErrorBoundary>
      <FloatingChatbot {...props} />
    </ChatbotErrorBoundary>
  );
}
