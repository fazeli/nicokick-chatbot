// A simplified version of the schema for Netlify deployment
import { z } from 'zod';

// User schema
export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type InsertUser = Omit<User, 'id'>;

// Message schema
export type Message = {
  id: number;
  sessionId: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  context?: string | null;
};

export type InsertMessage = Omit<Message, 'id'>;

// FAQ schema
export type Faq = {
  id: number;
  question: string;
  answer: string;
  topic: string;
  keywords: string[];
  embedding?: number[] | null;
};

export type InsertFaq = Omit<Faq, 'id'> & { id?: number };

// Product schema
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string | null;
};

export type InsertProduct = Omit<Product, 'id'>;

// Order schema
export type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: string[];
  totalAmount: number;
};

export type InsertOrder = Omit<Order, 'id'>;