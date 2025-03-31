"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = exports.EmbeddingService = void 0;
const transformers_1 = require("@xenova/transformers");
/**
 * Service for generating and comparing embeddings using Hugging Face models
 */
class EmbeddingService {
    constructor() {
        this.isInitialized = false;
        this.modelName = 'Xenova/all-MiniLM-L6-v2'; // Small but effective embedding model
        this.embeddingPipeline = null;
        // Initialize the model on first use
        this.initialize();
    }
    /**
     * Initialize the embedding model
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            console.log(`Initializing embedding model: ${this.modelName}`);
            this.embeddingPipeline = await (0, transformers_1.pipeline)('feature-extraction', this.modelName);
            this.isInitialized = true;
            console.log('Embedding model initialized successfully');
        }
        catch (error) {
            console.error('Error initializing embedding model:', error);
            throw new Error('Failed to initialize embedding model');
        }
    }
    /**
     * Generate an embedding for a text string
     * @param text - The text to embed
     * @returns The embedding vector
     */
    async generateEmbedding(text) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            // Generate embedding
            const result = await this.embeddingPipeline(text, {
                pooling: 'mean',
                normalize: true
            });
            // Convert to array
            return Array.from(result.data);
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding');
        }
    }
    /**
     * Calculate cosine similarity between two embedding vectors
     * @param embedding1 - First embedding vector
     * @param embedding2 - Second embedding vector
     * @returns Similarity score between 0 and 1
     */
    calculateSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Embedding dimensions do not match');
        }
        // Calculate dot product
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            magnitude1 += embedding1[i] * embedding1[i];
            magnitude2 += embedding2[i] * embedding2[i];
        }
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        // Avoid division by zero
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        // Return cosine similarity
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * Find the most similar documents to a query
     * @param queryEmbedding - The embedding of the query
     * @param documentEmbeddings - Array of document embeddings to compare against
     * @param similarityThreshold - Minimum similarity score (0-1) to consider a match
     * @returns Array of indices of similar documents, sorted by similarity
     */
    findSimilarDocuments(queryEmbedding, documentEmbeddings, similarityThreshold = 0.7) {
        const similarities = [];
        // Calculate similarity for each document
        for (let i = 0; i < documentEmbeddings.length; i++) {
            const similarity = this.calculateSimilarity(queryEmbedding, documentEmbeddings[i]);
            // Only include documents above the similarity threshold
            if (similarity >= similarityThreshold) {
                similarities.push({ index: i, similarity });
            }
        }
        // Sort by similarity (descending)
        return similarities.sort((a, b) => b.similarity - a.similarity);
    }
}
exports.EmbeddingService = EmbeddingService;
exports.embeddingService = new EmbeddingService();
