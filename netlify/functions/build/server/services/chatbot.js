"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const chatUtils_1 = require("../../client/src/lib/chatUtils");
class ChatbotService {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Generate welcome messages for a new chat session
     * @param sessionId - The chat session ID
     * @returns Array of welcome messages
     */
    async getWelcomeMessages(sessionId) {
        // Create welcome message
        const welcomeMessage = {
            sessionId,
            content: "Welcome to Nicokick! I'm your virtual assistant. How can I help you today?",
            isUser: false
        };
        // Create message with topics
        const topics = await this.storage.getFaqTopics();
        const topicsMessage = {
            sessionId,
            content: JSON.stringify({
                type: "faq-topics",
                text: "Here are some topics I can help with:",
                topics: topics
            }),
            isUser: false
        };
        // Store and return messages
        const welcomeMsg = await this.storage.createMessage(welcomeMessage);
        const topicsMsg = await this.storage.createMessage(topicsMessage);
        return [welcomeMsg, topicsMsg];
    }
    /**
     * Generate a response to a user message
     * @param sessionId - The chat session ID
     * @param userMessage - The user's message content
     * @returns The bot's response message
     */
    async generateResponse(sessionId, userMessage) {
        // First, check if this is an order status inquiry
        const orderNumber = (0, chatUtils_1.extractOrderNumber)(userMessage);
        if (orderNumber && this.isAboutOrderStatus(userMessage)) {
            return this.handleOrderStatusInquiry(sessionId, orderNumber);
        }
        // Check if this is about product information
        if (this.isAboutProducts(userMessage)) {
            return this.handleProductInquiry(sessionId, userMessage);
        }
        // Check if this is about human support
        if (this.isAboutHumanSupport(userMessage)) {
            return this.handleHumanSupportRequest(sessionId);
        }
        // Check for FAQ matches
        const keywords = this.extractKeywords(userMessage);
        const matchedFaqs = await this.storage.searchFaqsByKeywords(keywords);
        if (matchedFaqs.length > 0) {
            // Use the most relevant FAQ (first match)
            const bestMatch = matchedFaqs[0];
            const botResponse = {
                sessionId,
                content: bestMatch.answer,
                isUser: false
            };
            return await this.storage.createMessage(botResponse);
        }
        // Fallback response if no matches
        return this.createFallbackResponse(sessionId);
    }
    /**
     * Handle order status inquiries
     * @param sessionId - The chat session ID
     * @param orderNumber - The order number to look up
     * @returns Response message with order status info
     */
    async handleOrderStatusInquiry(sessionId, orderNumber) {
        // Check if we need to ask for the order number
        if (!orderNumber) {
            const askForOrderNumber = {
                sessionId,
                content: "I'd be happy to help you check your order status. Could you please provide your order number? You can find it in your order confirmation email.",
                isUser: false
            };
            return await this.storage.createMessage(askForOrderNumber);
        }
        // Look up the order
        const order = await this.storage.getOrderByNumber(orderNumber);
        if (!order) {
            const orderNotFound = {
                sessionId,
                content: `I couldn't find an order with the number ${orderNumber}. Please double-check the order number and try again, or contact our customer support for assistance.`,
                isUser: false
            };
            return await this.storage.createMessage(orderNotFound);
        }
        // Create response with order status information
        const statusMessage = JSON.stringify({
            type: "order-status",
            orderNumber: order.orderNumber,
            status: order.status,
            shippingMethod: order.shippingMethod,
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: order.trackingNumber,
            message: this.getOrderStatusMessage(order.status)
        });
        const orderStatusResponse = {
            sessionId,
            content: statusMessage,
            isUser: false
        };
        return await this.storage.createMessage(orderStatusResponse);
    }
    /**
     * Handle product inquiries
     * @param sessionId - The chat session ID
     * @param userMessage - The user's message
     * @returns Response message with product information
     */
    async handleProductInquiry(sessionId, userMessage) {
        // Extract product categories or specific products from the message
        const productTerms = this.extractProductTerms(userMessage);
        let products = [];
        // Search for matching products
        if (productTerms.length > 0) {
            for (const term of productTerms) {
                const results = await this.storage.searchProducts(term);
                products = [...products, ...results];
            }
            // Remove duplicates (by id)
            products = Array.from(new Map(products.map(p => [p.id, p])).values());
            // Limit to max 3 products for display
            products = products.slice(0, 3);
        }
        else {
            // If no specific terms, get some popular products
            const allProducts = await this.storage.getProducts();
            products = allProducts
                .filter(p => p.details && (p.details.bestSeller || p.details.newProduct))
                .slice(0, 3);
        }
        if (products.length === 0) {
            const noProductsFound = {
                sessionId,
                content: "I'm sorry, I couldn't find specific products matching your request. Please try a different search term or browse our product categories on our website.",
                isUser: false
            };
            return await this.storage.createMessage(noProductsFound);
        }
        // Create a product information response
        const productInfo = JSON.stringify({
            type: "product-info",
            text: "Here are some products that might interest you:",
            products: products.map(p => ({
                name: p.name,
                description: p.description,
                details: p.details
            })),
            conclusion: "Would you like specific information about any of these products or would you like to see more options?"
        });
        const productResponse = {
            sessionId,
            content: productInfo,
            isUser: false
        };
        return await this.storage.createMessage(productResponse);
    }
    /**
     * Handle human support requests
     * @param sessionId - The chat session ID
     * @returns Response message for human support
     */
    async handleHumanSupportRequest(sessionId) {
        const humanSupportResponse = JSON.stringify({
            type: "human-support",
            text: "I understand you'd like to speak with a human customer service representative. I'd be happy to connect you.",
            waitTime: "2-3 minutes"
        });
        const response = {
            sessionId,
            content: humanSupportResponse,
            isUser: false
        };
        return await this.storage.createMessage(response);
    }
    /**
     * Create a fallback response when no matches are found
     * @param sessionId - The chat session ID
     * @returns Fallback response message
     */
    async createFallbackResponse(sessionId) {
        const fallbackResponse = {
            sessionId,
            content: "I'm not sure I understand. Could you rephrase your question or select one of the topics above?",
            isUser: false
        };
        return await this.storage.createMessage(fallbackResponse);
    }
    /**
     * Extract keywords from a user message
     * @param message - The user's message
     * @returns Array of extracted keywords
     */
    extractKeywords(message) {
        // Remove punctuation and convert to lowercase
        const cleaned = message.toLowerCase().replace(/[^\w\s]/g, '');
        // Split into words
        const words = cleaned.split(/\s+/);
        // Filter out common stop words
        const stopWords = [
            'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
            'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
            'about', 'like', 'through', 'over', 'before', 'after', 'between',
            'under', 'above', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me',
            'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
            'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might',
            'must', 'have', 'has', 'had', 'do', 'does', 'did', 'am', 'is', 'are'
        ];
        // Return filtered keywords, ensuring they're at least 3 characters long
        return words.filter(word => !stopWords.includes(word) && word.length >= 3);
    }
    /**
     * Extract product-related terms from a message
     * @param message - The user's message
     * @returns Array of product-related terms
     */
    extractProductTerms(message) {
        const productCategories = [
            'nicotine pouches', 'pouches', 'lozenges', 'gum', 'mint', 'tobacco-free',
            'zyn', 'on!', 'velo', 'rogue', 'lucy', 'lyft', 'wintergreen', 'citrus'
        ];
        const lowercaseMessage = message.toLowerCase();
        return productCategories.filter(category => lowercaseMessage.includes(category.toLowerCase()));
    }
    /**
     * Check if a message is about order status
     * @param message - The user's message
     * @returns True if the message is about order status
     */
    isAboutOrderStatus(message) {
        const orderStatusTerms = [
            'order', 'status', 'track', 'package', 'tracking', 'shipping',
            'delivery', 'shipped', 'arrive', 'when', 'where is', 'check order'
        ];
        const lowercaseMessage = message.toLowerCase();
        return orderStatusTerms.some(term => lowercaseMessage.includes(term.toLowerCase()));
    }
    /**
     * Check if a message is about products
     * @param message - The user's message
     * @returns True if the message is about products
     */
    isAboutProducts(message) {
        const productTerms = [
            'product', 'nicotine', 'pouches', 'lozenges', 'gum', 'zyn', 'on!', 'velo',
            'rogue', 'lucy', 'lyft', 'mint', 'wintergreen', 'buy', 'purchase', 'recommend'
        ];
        const lowercaseMessage = message.toLowerCase();
        return productTerms.some(term => lowercaseMessage.includes(term.toLowerCase()));
    }
    /**
     * Check if a message is about human support
     * @param message - The user's message
     * @returns True if the message is about human support
     */
    isAboutHumanSupport(message) {
        const humanSupportTerms = [
            'human', 'agent', 'person', 'representative', 'support', 'service',
            'speak to someone', 'talk to someone', 'real person', 'real human',
            'customer service', 'help desk', 'call', 'assistance', 'connect me'
        ];
        const lowercaseMessage = message.toLowerCase();
        return humanSupportTerms.some(term => lowercaseMessage.includes(term.toLowerCase()));
    }
    /**
     * Get a status-specific message for an order
     * @param status - The order status
     * @returns Status-specific message
     */
    getOrderStatusMessage(status) {
        switch (status.toLowerCase()) {
            case 'processing':
                return "Your order is being processed. We'll update you once it ships. Is there anything else I can help you with?";
            case 'shipped':
                return "Your order has been shipped and is on its way! You can track it using the number above. Is there anything else I can help you with?";
            case 'delivered':
                return "Great news! Your order has been delivered. If you have any issues with your products, please let us know. Is there anything else I can help you with?";
            case 'cancelled':
                return "This order has been cancelled. If you didn't request this cancellation or have questions, please contact our customer support. Is there anything else I can help you with?";
            default:
                return "Your order status is updated above. Is there anything else I can help you with?";
        }
    }
}
exports.ChatbotService = ChatbotService;
