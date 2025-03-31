"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const cors_1 = __importDefault(require("cors"));
const storage_1 = require("../../server/storage");
const enhancedChatbot_1 = require("../../server/services/enhancedChatbot");
// Initialize express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize chatbot service
const chatbotService = new enhancedChatbot_1.EnhancedChatbotService(storage_1.storage);
// Chat routes
app.post("/api/chat/init", async (req, res) => {
    try {
        const sessionId = req.body.sessionId || Date.now().toString();
        const welcomeMessages = await chatbotService.getWelcomeMessages(sessionId);
        res.json(welcomeMessages);
    }
    catch (error) {
        console.error("Error initializing chat:", error);
        res.status(500).json({ error: "Failed to initialize chat" });
    }
});
app.post("/api/chat/message", async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        const message = await storage_1.storage.createMessage({
            sessionId,
            content,
            isUser: true,
        });
        res.json(message);
    }
    catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message" });
    }
});
app.post("/api/chat/response", async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        const botResponse = await chatbotService.generateResponse(sessionId, content);
        res.json(botResponse);
    }
    catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});
// FAQ routes
app.get("/api/faq/topics", async (_req, res) => {
    try {
        const topics = await storage_1.storage.getFaqTopics();
        res.json(topics);
    }
    catch (error) {
        console.error("Error fetching FAQ topics:", error);
        res.status(500).json({ error: "Failed to fetch FAQ topics" });
    }
});
app.get("/api/faq/topic/:topic", async (req, res) => {
    try {
        const { topic } = req.params;
        const faqs = await storage_1.storage.getFaqByTopic(topic);
        res.json(faqs);
    }
    catch (error) {
        console.error(`Error fetching FAQs for topic ${req.params.topic}:`, error);
        res.status(500).json({ error: "Failed to fetch FAQs for topic" });
    }
});
// Admin routes
app.get("/api/admin/faqs", async (_req, res) => {
    try {
        const faqs = await storage_1.storage.getFaqs();
        res.json(faqs);
    }
    catch (error) {
        console.error("Error fetching all FAQs:", error);
        res.status(500).json({ error: "Failed to fetch FAQs" });
    }
});
app.post("/api/admin/faqs", async (req, res) => {
    try {
        const faqData = req.body;
        const faq = await storage_1.storage.createFaq(faqData);
        res.status(201).json(faq);
    }
    catch (error) {
        console.error("Error creating FAQ:", error);
        res.status(500).json({ error: "Failed to create FAQ" });
    }
});
app.put("/api/admin/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const faqData = req.body;
        const faq = await storage_1.storage.updateFaq(parseInt(id), faqData);
        res.json(faq);
    }
    catch (error) {
        console.error(`Error updating FAQ ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update FAQ" });
    }
});
app.delete("/api/admin/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await storage_1.storage.deleteFaq(parseInt(id));
        res.json({ message: "FAQ deleted successfully" });
    }
    catch (error) {
        console.error(`Error deleting FAQ ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to delete FAQ" });
    }
});
// Product routes
app.get("/api/products", async (_req, res) => {
    try {
        const products = await storage_1.storage.getProducts();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
app.get("/api/products/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (typeof query !== 'string') {
            return res.status(400).json({ error: "Invalid query parameter" });
        }
        const products = await storage_1.storage.searchProducts(query);
        res.json(products);
    }
    catch (error) {
        console.error(`Error searching products:`, error);
        res.status(500).json({ error: "Failed to search products" });
    }
});
// Order routes
app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = await storage_1.storage.getOrderByNumber(orderNumber);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
    }
    catch (error) {
        console.error(`Error fetching order ${req.params.orderNumber}:`, error);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});
// Export the serverless handler
exports.handler = (0, serverless_http_1.default)(app);
