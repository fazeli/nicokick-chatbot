"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmbeddings = initializeEmbeddings;
const storage_1 = require("../storage");
const embeddingService_1 = require("./embeddingService");
/**
 * Initialize embeddings for all FAQs in storage
 * This process runs in the background and doesn't block application startup
 */
async function initializeEmbeddings() {
    try {
        console.log('Starting embedding initialization for FAQs...');
        // Get all FAQs
        const faqs = await storage_1.storage.getFaqs();
        // Process FAQs one by one to generate embeddings
        for (const faq of faqs) {
            try {
                // Skip if FAQ already has an embedding
                if (faq.embedding) {
                    continue;
                }
                // Combine question with keywords for a richer representation
                const textToEmbed = `${faq.question} ${faq.keywords.join(' ')}`;
                console.log(`Generating embedding for FAQ #${faq.id}: ${faq.question.substring(0, 30)}...`);
                // Generate embedding
                const embedding = await embeddingService_1.embeddingService.generateEmbedding(textToEmbed);
                // Update FAQ with embedding
                await storage_1.storage.updateFaqEmbedding(faq.id, embedding);
                console.log(`Updated embedding for FAQ #${faq.id}`);
            }
            catch (error) {
                console.error(`Failed to generate embedding for FAQ #${faq.id}:`, error);
                // Continue with other FAQs even if one fails
            }
        }
        console.log('FAQ embedding initialization completed.');
    }
    catch (error) {
        console.error('Failed to initialize FAQ embeddings:', error);
    }
}
