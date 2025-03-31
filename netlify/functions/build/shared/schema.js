"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertOrderSchema = exports.orders = exports.insertProductSchema = exports.products = exports.insertFaqSchema = exports.faqs = exports.insertMessageSchema = exports.messages = exports.insertUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// User schema (from the original file)
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
// Message schema
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sessionId: (0, pg_core_1.text)("session_id").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    isUser: (0, pg_core_1.boolean)("is_user").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull().defaultNow(),
});
exports.insertMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messages).pick({
    sessionId: true,
    content: true,
    isUser: true,
});
// FAQ schema
exports.faqs = (0, pg_core_1.pgTable)("faqs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    topic: (0, pg_core_1.text)("topic").notNull(),
    question: (0, pg_core_1.text)("question").notNull(),
    answer: (0, pg_core_1.text)("answer").notNull(),
    keywords: (0, pg_core_1.text)("keywords").array().notNull(),
    embedding: (0, pg_core_1.jsonb)("embedding"), // Question embedding vector
});
exports.insertFaqSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faqs).pick({
    topic: true,
    question: true,
    answer: true,
    keywords: true,
    embedding: true,
});
// Product schema
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    details: (0, pg_core_1.jsonb)("details"),
});
exports.insertProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.products).pick({
    name: true,
    description: true,
    category: true,
    imageUrl: true,
    details: true,
});
// Order schema
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderNumber: (0, pg_core_1.text)("order_number").notNull().unique(),
    status: (0, pg_core_1.text)("status").notNull(),
    shippingMethod: (0, pg_core_1.text)("shipping_method"),
    estimatedDelivery: (0, pg_core_1.text)("estimated_delivery"),
    trackingNumber: (0, pg_core_1.text)("tracking_number"),
    userId: (0, pg_core_1.integer)("user_id"),
    items: (0, pg_core_1.jsonb)("items"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders).pick({
    orderNumber: true,
    status: true,
    shippingMethod: true,
    estimatedDelivery: true,
    trackingNumber: true,
    userId: true,
    items: true,
});
