"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMessageAbout = exports.extractOrderNumber = exports.formatTimestamp = void 0;
/**
 * Formats a timestamp for display in chat messages
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string (e.g., "10:30 AM")
 */
const formatTimestamp = (timestamp) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
exports.formatTimestamp = formatTimestamp;
/**
 * Extracts order number from user message
 * @param message - User message
 * @returns Order number if found, null otherwise
 */
const extractOrderNumber = (message) => {
    // Look for patterns like #NK123456 or NK123456 or order number 123456
    const orderNumberRegex = /#?([A-Z]{0,2}\d{5,10})/i;
    const match = message.match(orderNumberRegex);
    if (match && match[1]) {
        // If it doesn't start with 'NK', add it
        const orderNum = match[1];
        if (!orderNum.toUpperCase().startsWith('NK')) {
            return `NK${orderNum}`;
        }
        return orderNum.toUpperCase();
    }
    return null;
};
exports.extractOrderNumber = extractOrderNumber;
/**
 * Determines if a message is about a specific topic
 * @param message - User message
 * @param keywords - Array of relevant keywords
 * @returns True if message matches the topic
 */
const isMessageAbout = (message, keywords) => {
    const normalizedMessage = message.toLowerCase();
    return keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()));
};
exports.isMessageAbout = isMessageAbout;
