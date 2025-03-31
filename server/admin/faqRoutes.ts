import { Router } from "express";
import { storage } from "../storage";
import { insertFaqSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import { embeddingService } from "../services/embeddingService";

const router = Router();

// Get all FAQs
router.get("/faqs", async (_req, res) => {
  try {
    const faqs = await storage.getFaqs();
    return res.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return res.status(500).json({ message: "Failed to fetch FAQs" });
  }
});

// Get a single FAQ by ID
router.get("/faqs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const faqs = await storage.getFaqs();
    const faq = faqs.find(f => f.id === id);
    
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    return res.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return res.status(500).json({ message: "Failed to fetch FAQ" });
  }
});

// Create a new FAQ
router.post("/faqs", async (req, res) => {
  try {
    const faqData = req.body;
    
    // Validate FAQ data
    const validatedFaq = insertFaqSchema.safeParse(faqData);
    
    if (!validatedFaq.success) {
      return res.status(400).json({ 
        message: "Invalid FAQ data",
        errors: validatedFaq.error.errors 
      });
    }
    
    // Update the faq.ts file
    await updateFaqDataFile([...await storage.getFaqs(), {
      ...validatedFaq.data,
      id: await getNextFaqId()
    }]);
    
    // Generate embedding for the new FAQ
    const newFaq = (await storage.getFaqs()).find(f => 
      f.question === validatedFaq.data.question && 
      f.topic === validatedFaq.data.topic
    );
    
    if (newFaq) {
      try {
        const textToEmbed = `${newFaq.question} ${newFaq.keywords.join(' ')}`;
        const embedding = await embeddingService.generateEmbedding(textToEmbed);
        await storage.updateFaqEmbedding(newFaq.id, embedding);
      } catch (error) {
        console.error("Error generating embedding for new FAQ:", error);
        // Continue even if embedding generation fails
      }
    }
    
    return res.status(201).json(newFaq || validatedFaq.data);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return res.status(500).json({ message: "Failed to create FAQ" });
  }
});

// Update an existing FAQ
router.put("/faqs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const faqData = req.body;
    const faqs = await storage.getFaqs();
    const faqIndex = faqs.findIndex(f => f.id === id);
    
    if (faqIndex === -1) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    // Update the FAQ
    const updatedFaq = {
      ...faqs[faqIndex],
      topic: faqData.topic || faqs[faqIndex].topic,
      question: faqData.question || faqs[faqIndex].question,
      answer: faqData.answer || faqs[faqIndex].answer,
      keywords: faqData.keywords || faqs[faqIndex].keywords
    };
    
    faqs[faqIndex] = updatedFaq;
    
    // Update the faq.ts file
    await updateFaqDataFile(faqs);
    
    // Generate new embedding if question or keywords changed
    if (
      updatedFaq.question !== faqs[faqIndex].question || 
      JSON.stringify(updatedFaq.keywords) !== JSON.stringify(faqs[faqIndex].keywords)
    ) {
      try {
        const textToEmbed = `${updatedFaq.question} ${updatedFaq.keywords.join(' ')}`;
        const embedding = await embeddingService.generateEmbedding(textToEmbed);
        await storage.updateFaqEmbedding(id, embedding);
        updatedFaq.embedding = embedding;
      } catch (error) {
        console.error("Error generating new embedding for updated FAQ:", error);
        // Continue even if embedding generation fails
      }
    }
    
    return res.json(updatedFaq);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return res.status(500).json({ message: "Failed to update FAQ" });
  }
});

// Delete an FAQ
router.delete("/faqs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const faqs = await storage.getFaqs();
    const updatedFaqs = faqs.filter(f => f.id !== id);
    
    if (faqs.length === updatedFaqs.length) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    // Update the faq.ts file
    await updateFaqDataFile(updatedFaqs);
    
    return res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return res.status(500).json({ message: "Failed to delete FAQ" });
  }
});

// Helper function to get the next FAQ ID
async function getNextFaqId(): Promise<number> {
  const faqs = await storage.getFaqs();
  return faqs.length > 0 
    ? Math.max(...faqs.map(f => f.id)) + 1 
    : 1;
}

// Helper function to update the faq.ts file
async function updateFaqDataFile(faqs: any[]): Promise<void> {
  const faqsFilePath = path.join(__dirname, "../data/faq.ts");
  
  // Create a backup first
  const backupPath = path.join(__dirname, "../data/faq.backup.ts");
  if (fs.existsSync(faqsFilePath)) {
    fs.copyFileSync(faqsFilePath, backupPath);
  }
  
  try {
    // Format FAQ data as TypeScript
    const faqsContent = `import { type InsertFaq } from "@shared/schema";

export const faqData: InsertFaq[] = ${JSON.stringify(faqs, null, 2)
  .replace(/"([^"]+)":/g, '$1:') // Convert "key": to key:
  .replace(/"/g, "'") // Convert double quotes to single quotes
};
`;
    
    // Write to file
    fs.writeFileSync(faqsFilePath, faqsContent);
    
    // Reload the FAQs in storage
    const { faqData } = await import("../data/faq");
    await storage.initializeFaqs(faqData);
  } catch (error) {
    // Restore from backup if something went wrong
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, faqsFilePath);
    }
    throw error;
  } finally {
    // Clean up backup
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }
}

export default router;