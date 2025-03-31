"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
class MemStorage {
    constructor() {
        this.users = new Map();
        this.messages = [];
        this.faqs = [];
        this.products = [];
        this.orders = [];
        this.currentId = {
            users: 1,
            messages: 1,
            faqs: 1,
            products: 1,
            orders: 1
        };
    }
    // User methods (from original file)
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentId.users++;
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    // Message methods
    async createMessage(insertMessage) {
        const id = this.currentId.messages++;
        const timestamp = new Date();
        const message = {
            ...insertMessage,
            id,
            timestamp
        };
        this.messages.push(message);
        return message;
    }
    async getMessagesBySessionId(sessionId) {
        return this.messages.filter(message => message.sessionId === sessionId);
    }
    async clearMessagesBySessionId(sessionId) {
        this.messages = this.messages.filter(message => message.sessionId !== sessionId);
    }
    // FAQ methods
    async getFaqs() {
        return this.faqs;
    }
    async getFaqByTopic(topic) {
        return this.faqs.filter(faq => faq.topic.toLowerCase() === topic.toLowerCase());
    }
    async getFaqTopics() {
        // Get unique topics using Array.from to avoid Set iteration issues
        const topicsSet = new Set();
        this.faqs.forEach(faq => topicsSet.add(faq.topic));
        return Array.from(topicsSet);
    }
    async searchFaqsByKeywords(keywords) {
        // Search for FAQs that match any of the keywords
        const normalizedKeywords = keywords.map(k => k.toLowerCase());
        return this.faqs.filter(faq => {
            // Check if the FAQ's keywords match any of the search keywords
            const faqKeywords = faq.keywords.map(k => k.toLowerCase());
            return normalizedKeywords.some(keyword => faqKeywords.includes(keyword) ||
                faq.question.toLowerCase().includes(keyword) ||
                faq.answer.toLowerCase().includes(keyword));
        });
    }
    async searchFaqsByEmbedding(queryEmbedding, similarityThreshold = 0.7) {
        // Get FAQs with embeddings
        const faqsWithEmbeddings = this.faqs.filter(faq => faq.embedding != null);
        if (faqsWithEmbeddings.length === 0) {
            return [];
        }
        // Import the embedding service
        const { embeddingService } = await Promise.resolve().then(() => __importStar(require('./services/embeddingService')));
        // Create array of embeddings from FAQs
        const embeddings = faqsWithEmbeddings.map(faq => faq.embedding);
        // Find similar FAQs
        const similarFaqs = embeddingService.findSimilarDocuments(queryEmbedding, embeddings, similarityThreshold);
        // Map indices back to FAQ objects
        return similarFaqs.map(({ index }) => faqsWithEmbeddings[index]);
    }
    async updateFaqEmbedding(faqId, embedding) {
        const faqIndex = this.faqs.findIndex(faq => faq.id === faqId);
        if (faqIndex !== -1) {
            this.faqs[faqIndex] = {
                ...this.faqs[faqIndex],
                embedding
            };
        }
    }
    async getFaqsWithEmbeddings() {
        return this.faqs.filter(faq => faq.embedding != null);
    }
    async createFaq(faq) {
        const id = faq.id || this.currentId.faqs++;
        const newFaq = {
            ...faq,
            id,
            embedding: faq.embedding || null
        };
        this.faqs.push(newFaq);
        // Update FAQ data file for persistence
        this.updateFaqData();
        return newFaq;
    }
    async updateFaq(id, faqUpdate) {
        const faqIndex = this.faqs.findIndex(faq => faq.id === id);
        if (faqIndex === -1) {
            throw new Error(`FAQ with id ${id} not found`);
        }
        const updatedFaq = {
            ...this.faqs[faqIndex],
            ...faqUpdate,
            id // Ensure ID remains unchanged
        };
        this.faqs[faqIndex] = updatedFaq;
        // Update FAQ data file for persistence
        this.updateFaqData();
        return updatedFaq;
    }
    async deleteFaq(id) {
        const faqIndex = this.faqs.findIndex(faq => faq.id === id);
        if (faqIndex === -1) {
            throw new Error(`FAQ with id ${id} not found`);
        }
        // Remove the FAQ
        this.faqs.splice(faqIndex, 1);
        // Update FAQ data file for persistence
        this.updateFaqData();
    }
    // Helper method to update FAQ data file
    updateFaqData() {
        // This would normally write to a file, but we'll just log for now
        // In a real implementation, this would update server/data/faq.ts
        console.log("FAQ data updated in memory storage");
        // In production, implement file persistence:
        // import fs from 'fs';
        // const faqDataPath = path.join(__dirname, 'data/faq.ts');
        // const faqContent = `export const faqData = ${JSON.stringify(this.faqs, null, 2)};`;
        // fs.writeFileSync(faqDataPath, faqContent);
    }
    // Product methods
    async getProducts() {
        return this.products;
    }
    async getProductsByCategory(category) {
        return this.products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }
    async searchProducts(query) {
        const normalizedQuery = query.toLowerCase();
        return this.products.filter(product => product.name.toLowerCase().includes(normalizedQuery) ||
            product.description.toLowerCase().includes(normalizedQuery) ||
            product.category.toLowerCase().includes(normalizedQuery));
    }
    // Order methods
    async getOrderByNumber(orderNumber) {
        return this.orders.find(order => order.orderNumber.toLowerCase() === orderNumber.toLowerCase());
    }
    // Initialization methods to load data
    async initializeFaqs(faqs) {
        this.faqs = faqs.map((faq, index) => ({
            ...faq,
            id: index + 1,
            embedding: faq.embedding || null // Ensure embedding is always defined
        }));
        this.currentId.faqs = this.faqs.length + 1;
    }
    async initializeProducts(products) {
        this.products = products.map((product, index) => ({
            ...product,
            id: index + 1,
            imageUrl: product.imageUrl || null, // Ensure imageUrl is always defined
            details: product.details || {} // Ensure details is always defined
        }));
        this.currentId.products = this.products.length + 1;
    }
    async initializeOrders(orders) {
        this.orders = orders.map((order, index) => ({
            ...order,
            id: index + 1,
            createdAt: new Date(),
            shippingMethod: order.shippingMethod || null,
            estimatedDelivery: order.estimatedDelivery || null,
            trackingNumber: order.trackingNumber || null,
            userId: order.userId || null,
            items: order.items || {}
        }));
        this.currentId.orders = this.orders.length + 1;
    }
}
exports.MemStorage = MemStorage;
// Initialize the storage with FAQ, product, and order data
const faq_1 = require("./data/faq");
const products_1 = require("./data/products");
const orders_1 = require("./data/orders");
exports.storage = new MemStorage();
// Initialize data
(async () => {
    await exports.storage.initializeFaqs(faq_1.faqData);
    await exports.storage.initializeProducts(products_1.productData);
    await exports.storage.initializeOrders(orders_1.orderData);
})();
