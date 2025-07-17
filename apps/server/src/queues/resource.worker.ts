import { Worker } from "bullmq";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { RESOURCE_QUEUE_KEYS } from "./keys";
import { connection } from "./redis";
import env from "@/config/env";
import { db } from "@/db";
import { resourceEmbeddings } from "@/db/schema";
import { TaskType } from "@google/generative-ai";

const resourceWorker = new Worker(
  RESOURCE_QUEUE_KEYS.QUEUE_NAME,
  async (job) => {
    console.log("👷 Processing job:", job.name);
    console.log("📦 Data:", job.data);

    const { type, userId, url, resourceId } = job.data;

    if (type === "pdf") {
      console.log(`📄 Processing PDF for user ${userId} at ${url}`);

      // 1. Load PDF
      const loader = new PDFLoader(process.cwd() + url);
      const docs = await loader.load(); // this returns an array of Documents with page content

      // 2. Chunk documents into paragraphs or sections
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await textSplitter.splitDocuments(docs); // returns Document[]

      // 3. Extract text content
      const texts = splitDocs.map((doc) => doc.pageContent);

      // 4. Embed the text chunks
      const embedder = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        apiKey: env.GOOGLE_API_KEY,
      });

      const vectors = await embedder.embedDocuments(texts);

      // 5. Store in pgvector via Drizzle
      for (let i = 0; i < texts.length; i++) {
        await db.insert(resourceEmbeddings).values({
          resourceId,
          content: texts[i],
          embedding: vectors[i],
          userId,
        });
      }

      console.log(`✅ Embedded and stored ${texts.length} chunks.`);
      return { status: "done" };
    }

    if (type === "youtube") {
      // Example: fetch transcript
    }

    if (type === "image") {
      // Example: OCR, resize, etc.
    }

    // Mark job complete
    return { status: "done" };
  },
  { connection },
);

resourceWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
