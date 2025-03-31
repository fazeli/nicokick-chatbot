import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { ChatbotService } from "./services/chatbot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize chatbot service
  const chatbotService = new ChatbotService(storage);

  // API Routes - all prefixed with /api
  
  // Chat initialization route
  app.post("/api/chat/init", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      // Create welcome messages
      const initialMessages = await chatbotService.getWelcomeMessages(sessionId);
      
      return res.json(initialMessages);
    } catch (error) {
      console.error("Error initializing chat:", error);
      return res.status(500).json({ message: "Failed to initialize chat" });
    }
  });
  
  // Send message route
  app.post("/api/chat/message", async (req, res) => {
    try {
      const messageData = req.body;
      
      // Validate message data
      const validatedMessage = insertMessageSchema.safeParse(messageData);
      
      if (!validatedMessage.success) {
        return res.status(400).json({ 
          message: "Invalid message data",
          errors: validatedMessage.error.errors 
        });
      }
      
      // Store message
      const message = await storage.createMessage(validatedMessage.data);
      
      return res.json(message);
    } catch (error) {
      console.error("Error saving message:", error);
      return res.status(500).json({ message: "Failed to save message" });
    }
  });
  
  // Generate bot response route
  app.post("/api/chat/response", async (req, res) => {
    try {
      const { sessionId, userMessage } = req.body;
      
      if (!sessionId || !userMessage) {
        return res.status(400).json({ message: "Session ID and user message are required" });
      }
      
      // Generate response
      const botResponse = await chatbotService.generateResponse(sessionId, userMessage);
      
      return res.json(botResponse);
    } catch (error) {
      console.error("Error generating response:", error);
      return res.status(500).json({ message: "Failed to generate response" });
    }
  });
  
  // Clear chat history route
  app.post("/api/chat/clear", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      // Clear messages
      await storage.clearMessagesBySessionId(sessionId);
      
      return res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return res.status(500).json({ message: "Failed to clear chat history" });
    }
  });
  
  // Get FAQ topics route
  app.get("/api/faq/topics", async (_req, res) => {
    try {
      const topics = await storage.getFaqTopics();
      return res.json(topics);
    } catch (error) {
      console.error("Error fetching FAQ topics:", error);
      return res.status(500).json({ message: "Failed to fetch FAQ topics" });
    }
  });
  
  // Search FAQs route
  app.get("/api/faq/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Split query into keywords
      const keywords = query.split(/\s+/).filter(kw => kw.length > 2);
      
      if (keywords.length === 0) {
        return res.status(400).json({ message: "Search query must contain valid keywords" });
      }
      
      // Search FAQs
      const results = await storage.searchFaqsByKeywords(keywords);
      
      return res.json(results);
    } catch (error) {
      console.error("Error searching FAQs:", error);
      return res.status(500).json({ message: "Failed to search FAQs" });
    }
  });
  
  // Get order status route
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const { orderNumber } = req.params;
      
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }
      
      // Get order
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Search products route
  app.get("/api/products/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Search products
      const results = await storage.searchProducts(query);
      
      return res.json(results);
    } catch (error) {
      console.error("Error searching products:", error);
      return res.status(500).json({ message: "Failed to search products" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
