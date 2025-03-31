import { 
  users, type User, type InsertUser,
  messages, type Message, type InsertMessage,
  faqs, type Faq, type InsertFaq,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder
} from "@shared/schema";

export interface IStorage {
  // User methods (from original file)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  clearMessagesBySessionId(sessionId: string): Promise<void>;
  
  // FAQ methods
  getFaqs(): Promise<Faq[]>;
  getFaqByTopic(topic: string): Promise<Faq[]>;
  getFaqTopics(): Promise<string[]>;
  searchFaqsByKeywords(keywords: string[]): Promise<Faq[]>;
  searchFaqsByEmbedding(queryEmbedding: number[], similarityThreshold?: number): Promise<Faq[]>;
  updateFaqEmbedding(faqId: number, embedding: number[]): Promise<void>;
  getFaqsWithEmbeddings(): Promise<Faq[]>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Order methods
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Message[];
  private faqs: Faq[];
  private products: Product[];
  private orders: Order[];
  currentId: { [key: string]: number };

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
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const timestamp = new Date();
    const message: Message = { 
      ...insertMessage,
      id,
      timestamp
    };
    this.messages.push(message);
    return message;
  }
  
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return this.messages.filter(message => message.sessionId === sessionId);
  }
  
  async clearMessagesBySessionId(sessionId: string): Promise<void> {
    this.messages = this.messages.filter(message => message.sessionId !== sessionId);
  }
  
  // FAQ methods
  async getFaqs(): Promise<Faq[]> {
    return this.faqs;
  }
  
  async getFaqByTopic(topic: string): Promise<Faq[]> {
    return this.faqs.filter(faq => 
      faq.topic.toLowerCase() === topic.toLowerCase()
    );
  }
  
  async getFaqTopics(): Promise<string[]> {
    // Get unique topics using Array.from to avoid Set iteration issues
    const topicsSet = new Set<string>();
    this.faqs.forEach(faq => topicsSet.add(faq.topic));
    return Array.from(topicsSet);
  }
  
  async searchFaqsByKeywords(keywords: string[]): Promise<Faq[]> {
    // Search for FAQs that match any of the keywords
    const normalizedKeywords = keywords.map(k => k.toLowerCase());
    
    return this.faqs.filter(faq => {
      // Check if the FAQ's keywords match any of the search keywords
      const faqKeywords = faq.keywords.map(k => k.toLowerCase());
      return normalizedKeywords.some(keyword => 
        faqKeywords.includes(keyword) || 
        faq.question.toLowerCase().includes(keyword) ||
        faq.answer.toLowerCase().includes(keyword)
      );
    });
  }
  
  async searchFaqsByEmbedding(queryEmbedding: number[], similarityThreshold: number = 0.7): Promise<Faq[]> {
    // Get FAQs with embeddings
    const faqsWithEmbeddings = this.faqs.filter(faq => faq.embedding != null);
    
    if (faqsWithEmbeddings.length === 0) {
      return [];
    }
    
    // Import the embedding service
    const { embeddingService } = await import('./services/embeddingService');
    
    // Create array of embeddings from FAQs
    const embeddings: number[][] = faqsWithEmbeddings.map(faq => faq.embedding as number[]);
    
    // Find similar FAQs
    const similarFaqs = embeddingService.findSimilarDocuments(
      queryEmbedding,
      embeddings,
      similarityThreshold
    );
    
    // Map indices back to FAQ objects
    return similarFaqs.map(({ index }) => faqsWithEmbeddings[index]);
  }
  
  async updateFaqEmbedding(faqId: number, embedding: number[]): Promise<void> {
    const faqIndex = this.faqs.findIndex(faq => faq.id === faqId);
    
    if (faqIndex !== -1) {
      this.faqs[faqIndex] = {
        ...this.faqs[faqIndex],
        embedding
      };
    }
  }
  
  async getFaqsWithEmbeddings(): Promise<Faq[]> {
    return this.faqs.filter(faq => faq.embedding != null);
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.products;
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const normalizedQuery = query.toLowerCase();
    
    return this.products.filter(product => 
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery)
    );
  }
  
  // Order methods
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return this.orders.find(order => 
      order.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    );
  }
  
  // Initialization methods to load data
  async initializeFaqs(faqs: InsertFaq[]): Promise<void> {
    this.faqs = faqs.map((faq, index) => ({
      ...faq,
      id: index + 1,
      embedding: faq.embedding || null // Ensure embedding is always defined
    })) as Faq[];
    this.currentId.faqs = this.faqs.length + 1;
  }
  
  async initializeProducts(products: InsertProduct[]): Promise<void> {
    this.products = products.map((product, index) => ({
      ...product,
      id: index + 1,
      imageUrl: product.imageUrl || null, // Ensure imageUrl is always defined
      details: product.details || {} // Ensure details is always defined
    })) as Product[];
    this.currentId.products = this.products.length + 1;
  }
  
  async initializeOrders(orders: InsertOrder[]): Promise<void> {
    this.orders = orders.map((order, index) => ({
      ...order,
      id: index + 1,
      createdAt: new Date(),
      shippingMethod: order.shippingMethod || null,
      estimatedDelivery: order.estimatedDelivery || null,
      trackingNumber: order.trackingNumber || null,
      userId: order.userId || null,
      items: order.items || {}
    })) as Order[];
    this.currentId.orders = this.orders.length + 1;
  }
}

// Initialize the storage with FAQ, product, and order data
import { faqData } from "./data/faq";
import { productData } from "./data/products";
import { orderData } from "./data/orders";

export const storage = new MemStorage();

// Initialize data
(async () => {
  await storage.initializeFaqs(faqData);
  await storage.initializeProducts(productData);
  await storage.initializeOrders(orderData);
})();
