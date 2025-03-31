import express, { Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import cors from "cors";
import { storage, IStorage } from "../../server/storage";
import { Message, InsertMessage, Faq, InsertFaq } from "../../shared/schema";
import { EnhancedChatbotService } from "../../server/services/enhancedChatbot";

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize chatbot service
const chatbotService = new EnhancedChatbotService(storage);

// Chat routes
app.post("/api/chat/init", async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId || Date.now().toString();
    const welcomeMessages = await chatbotService.getWelcomeMessages(sessionId);
    res.json(welcomeMessages);
  } catch (error) {
    console.error("Error initializing chat:", error);
    res.status(500).json({ error: "Failed to initialize chat" });
  }
});

app.post("/api/chat/message", async (req: Request, res: Response) => {
  try {
    const { sessionId, content } = req.body;
    const message = await storage.createMessage({
      sessionId,
      content,
      isUser: true,
    });
    res.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

app.post("/api/chat/response", async (req: Request, res: Response) => {
  try {
    const { sessionId, content } = req.body;
    const botResponse = await chatbotService.generateResponse(sessionId, content);
    res.json(botResponse);
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// FAQ routes
app.get("/api/faq/topics", async (_req: Request, res: Response) => {
  try {
    const topics = await storage.getFaqTopics();
    res.json(topics);
  } catch (error) {
    console.error("Error fetching FAQ topics:", error);
    res.status(500).json({ error: "Failed to fetch FAQ topics" });
  }
});

app.get("/api/faq/topic/:topic", async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const faqs = await storage.getFaqByTopic(topic);
    res.json(faqs);
  } catch (error) {
    console.error(`Error fetching FAQs for topic ${req.params.topic}:`, error);
    res.status(500).json({ error: "Failed to fetch FAQs for topic" });
  }
});

// Admin routes
app.get("/api/admin/faqs", async (_req: Request, res: Response) => {
  try {
    const faqs = await storage.getFaqs();
    res.json(faqs);
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.post("/api/admin/faqs", async (req: Request, res: Response) => {
  try {
    const faqData = req.body;
    const faq = await storage.createFaq(faqData);
    res.status(201).json(faq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

app.put("/api/admin/faqs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const faqData = req.body;
    const faq = await storage.updateFaq(parseInt(id), faqData);
    res.json(faq);
  } catch (error) {
    console.error(`Error updating FAQ ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

app.delete("/api/admin/faqs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteFaq(parseInt(id));
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error(`Error deleting FAQ ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// Product routes
app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/search", async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (typeof query !== 'string') {
      return res.status(400).json({ error: "Invalid query parameter" });
    }
    const products = await storage.searchProducts(query);
    res.json(products);
  } catch (error) {
    console.error(`Error searching products:`, error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

// Order routes
app.get("/api/orders/:orderNumber", async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const order = await storage.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    console.error(`Error fetching order ${req.params.orderNumber}:`, error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the serverless handler
export const handler = serverless(app);