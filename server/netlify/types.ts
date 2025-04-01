// Type definitions for use in the Netlify Functions

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export type InsertUser = Omit<User, 'id'>;

export interface Message {
  id: number;
  sessionId: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  context?: string | null;
}

export type InsertMessage = Omit<Message, 'id'>;

export interface Faq {
  id: number;
  question: string;
  answer: string;
  topic: string;
  keywords: string[];
  embedding?: number[] | null;
}

export type InsertFaq = Omit<Faq, 'id'> & { id?: number };

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  details?: any;
}

export type InsertProduct = Omit<Product, 'id'>;

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: string[];
  totalAmount: number;
  shippingMethod?: string | null;
  estimatedDelivery?: string | null;
  trackingNumber?: string | null;
  userId?: number | null;
}

export type InsertOrder = Omit<Order, 'id'>;