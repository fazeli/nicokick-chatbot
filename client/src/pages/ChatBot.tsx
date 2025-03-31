import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type Message } from "@shared/schema";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import SuggestionButton from "@/components/chat/SuggestionButton";
import { formatTimestamp } from "@/lib/chatUtils";

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial session setup and welcome message
  useEffect(() => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    
    // Initialize conversation with welcome messages
    fetchInitialMessages(newSessionId);
  }, []);

  const fetchInitialMessages = async (sid: string) => {
    try {
      const response = await apiRequest(
        "POST", 
        "/api/chat/init", 
        { sessionId: sid }
      );
      const initialMessages = await response.json();
      setMessages(initialMessages);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  };

  // Fetch FAQ topics
  const { data: faqTopics } = useQuery({
    queryKey: ['/api/faq/topics'],
    staleTime: Infinity,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest(
        "POST",
        "/api/chat/message",
        { 
          sessionId,
          content,
          isUser: true 
        }
      );
      return await response.json();
    },
    onSuccess: (userMessage) => {
      setMessages(prev => [...prev, userMessage]);
      // Show typing indicator
      setIsTyping(true);
      // Get bot response
      getBotResponseMutation.mutate(userMessage.content);
    }
  });

  // Get bot response mutation
  const getBotResponseMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const response = await apiRequest(
        "POST",
        "/api/chat/response",
        { 
          sessionId,
          userMessage 
        }
      );
      return await response.json();
    },
    onSuccess: (botResponse) => {
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessageMutation.mutate(inputValue);
      setInputValue("");
    }
  };

  // Handle FAQ topic selection
  const handleTopicClick = (topic: string) => {
    const message = `Tell me about ${topic}`;
    setInputValue(message);
    sendMessageMutation.mutate(message);
    setInputValue("");
  };

  // Handle human support request
  const handleHumanSupport = () => {
    const message = "I need to speak to a real person";
    sendMessageMutation.mutate(message);
    setInputValue("");
  };

  // Handle clear chat
  const handleClearChat = async () => {
    try {
      await apiRequest(
        "POST",
        "/api/chat/clear",
        { sessionId }
      );
      
      // Start a new session
      const newSessionId = Date.now().toString();
      setSessionId(newSessionId);
      fetchInitialMessages(newSessionId);
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="relative h-screen flex flex-col bg-slate-50 max-w-md mx-auto shadow-lg">
      {/* Header Section */}
      <div className="bg-[#1e3a8a] text-white p-4 flex items-center sticky top-0 z-10">
        <div className="rounded-full w-8 h-8 mr-3 bg-white/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h1 className="font-semibold text-lg">Nicokick Assistant</h1>
          <div className="flex items-center text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
            <span>Online</span>
          </div>
        </div>
        <button className="ml-auto text-white p-2 hover:bg-[#3b82f6]/30 rounded-full transition-colors" aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={formatTimestamp(message.timestamp)}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <ChatInput 
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
        />
        
        <div className="flex justify-between items-center mt-3 px-1">
          <button className="text-xs text-[#3b82f6] hover:underline flex items-center" onClick={() => queryClient.refetchQueries({ queryKey: ['/api/faq/topics'] })}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            FAQ
          </button>
          
          <button className="text-xs text-[#3b82f6] hover:underline flex items-center" onClick={handleHumanSupport}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Human Support
          </button>
          
          <button className="text-xs text-[#3b82f6] hover:underline flex items-center" onClick={handleClearChat}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
