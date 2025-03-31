"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const schema_1 = require("@shared/schema");
const enhancedChatbot_1 = require("./services/enhancedChatbot");
const embeddingInitService_1 = require("./services/embeddingInitService");
const faqRoutes_1 = __importDefault(require("./admin/faqRoutes"));
async function registerRoutes(app) {
    // Initialize chatbot service with enhanced AI capabilities
    const chatbotService = new enhancedChatbot_1.EnhancedChatbotService(storage_1.storage);
    // Initialize embeddings for FAQs in the background
    // This won't block application startup
    (0, embeddingInitService_1.initializeEmbeddings)().catch(error => {
        console.error("Error initializing embeddings:", error);
    });
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
        }
        catch (error) {
            console.error("Error initializing chat:", error);
            return res.status(500).json({ message: "Failed to initialize chat" });
        }
    });
    // Send message route
    app.post("/api/chat/message", async (req, res) => {
        try {
            const messageData = req.body;
            // Validate message data
            const validatedMessage = schema_1.insertMessageSchema.safeParse(messageData);
            if (!validatedMessage.success) {
                return res.status(400).json({
                    message: "Invalid message data",
                    errors: validatedMessage.error.errors
                });
            }
            // Store message
            const message = await storage_1.storage.createMessage(validatedMessage.data);
            return res.json(message);
        }
        catch (error) {
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
        }
        catch (error) {
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
            await storage_1.storage.clearMessagesBySessionId(sessionId);
            return res.json({ message: "Chat history cleared" });
        }
        catch (error) {
            console.error("Error clearing chat history:", error);
            return res.status(500).json({ message: "Failed to clear chat history" });
        }
    });
    // Get FAQ topics route
    app.get("/api/faq/topics", async (_req, res) => {
        try {
            const topics = await storage_1.storage.getFaqTopics();
            return res.json(topics);
        }
        catch (error) {
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
            const results = await storage_1.storage.searchFaqsByKeywords(keywords);
            return res.json(results);
        }
        catch (error) {
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
            const order = await storage_1.storage.getOrderByNumber(orderNumber);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            return res.json(order);
        }
        catch (error) {
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
            const results = await storage_1.storage.searchProducts(query);
            return res.json(results);
        }
        catch (error) {
            console.error("Error searching products:", error);
            return res.status(500).json({ message: "Failed to search products" });
        }
    });
    // Register admin routes
    app.use("/api/admin", faqRoutes_1.default);
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
