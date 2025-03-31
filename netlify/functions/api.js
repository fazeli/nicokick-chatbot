const express = require("express");
const serverless = require("serverless-http");
const { storage } = require("../../server/storage");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import chat services
const { EnhancedChatbotService } = require("../../server/services/enhancedChatbot");

// Create a new Express app for the serverless function
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize chatbot service
const chatbotService = new EnhancedChatbotService(storage);

// Chat routes
app.post("/api/chat/init", async (req, res) => {
  try {
    const sessionId = req.body.sessionId || Date.now().toString();
    const welcomeMessages = await chatbotService.getWelcomeMessages(sessionId);
    res.json(welcomeMessages);
  } catch (error) {
    console.error("Error initializing chat:", error);
    res.status(500).json({ error: "Failed to initialize chat" });
  }
});

app.post("/api/chat/message", async (req, res) => {
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

app.post("/api/chat/response", async (req, res) => {
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
app.get("/api/faq/topics", async (req, res) => {
  try {
    const topics = await storage.getFaqTopics();
    res.json(topics);
  } catch (error) {
    console.error("Error fetching FAQ topics:", error);
    res.status(500).json({ error: "Failed to fetch FAQ topics" });
  }
});

app.get("/api/faq/topic/:topic", async (req, res) => {
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
app.get("/api/admin/faqs", async (req, res) => {
  try {
    const faqs = await storage.getFaqs();
    res.json(faqs);
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.post("/api/admin/faqs", async (req, res) => {
  try {
    const faqData = req.body;
    const faq = await storage.createFaq(faqData);
    res.status(201).json(faq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

app.put("/api/admin/faqs/:id", async (req, res) => {
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

app.delete("/api/admin/faqs/:id", async (req, res) => {
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
app.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/search", async (req, res) => {
  try {
    const { query } = req.query;
    const products = await storage.searchProducts(query);
    res.json(products);
  } catch (error) {
    console.error(`Error searching products with query ${req.query.query}:`, error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

// Order routes
app.get("/api/orders/:orderNumber", async (req, res) => {
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
app.use((err, req, res, next) => {
  console.error("API error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the serverless handler
module.exports.handler = serverless(app);