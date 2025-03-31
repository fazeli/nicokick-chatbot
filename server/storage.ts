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
    // Get unique topics
    return [...new Set(this.faqs.map(faq => faq.topic))];
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
      id: index + 1
    }));
    this.currentId.faqs = this.faqs.length + 1;
  }
  
  async initializeProducts(products: InsertProduct[]): Promise<void> {
    this.products = products.map((product, index) => ({
      ...product,
      id: index + 1
    }));
    this.currentId.products = this.products.length + 1;
  }
  
  async initializeOrders(orders: InsertOrder[]): Promise<void> {
    this.orders = orders.map((order, index) => ({
      ...order,
      id: index + 1,
      createdAt: new Date()
    }));
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
