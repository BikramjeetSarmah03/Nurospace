import { API } from "@/lib/api-client";
import type { MentionableDocument } from "../components/mention-popup";

export interface UserDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "video" | "text";
  url: string;
  createdAt: string;
  userId: string;
}

export const documentService = {
  async getUserDocuments(): Promise<MentionableDocument[]> {
    try {
      const response = await API.get("/resources");

      if (response.success && response.data) {
        return response.data.map((doc: UserDocument) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          content: doc.name, // You can add actual content here if needed
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch user documents:", error);
      return [];
    }
  },

  async searchDocuments(query: string): Promise<MentionableDocument[]> {
    try {
      const response = await API.get(
        `/resources/search?q=${encodeURIComponent(query)}`,
      );

      if (response.success && response.data) {
        return response.data.map((doc: UserDocument) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          content: doc.name,
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to search documents:", error);
      return [];
    }
  },
};
