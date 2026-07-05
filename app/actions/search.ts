"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function searchDocumentsByTitle(
  title: string,
  fuzzy?: boolean
): Promise<{ id: string; title: string; isArchived: boolean }[]> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all documents for this user using existing getSidebar query
    const allDocs = await client.query(api.documents.getSidebar, {
      parentDocument: undefined,
    });

    // Filter by title (exact or fuzzy match)
    const titleLower = title.toLowerCase();
    const filtered = allDocs.filter((doc: any) => {
      const docTitleLower = doc.title.toLowerCase();
      if (fuzzy) {
        // Fuzzy match: all chars of query appear in order in title
        let queryIdx = 0;
        for (let i = 0; i < docTitleLower.length && queryIdx < titleLower.length; i++) {
          if (docTitleLower[i] === titleLower[queryIdx]) {
            queryIdx++;
          }
        }
        return queryIdx === titleLower.length;
      } else {
        // Exact substring match
        return docTitleLower.includes(titleLower);
      }
    });

    return filtered.map((doc: any) => ({
      id: doc._id,
      title: doc.title,
      isArchived: doc.isArchived,
    }));
  } catch (error) {
    console.error("[v0] searchDocumentsByTitle error:", error);
    throw error;
  }
}

export async function searchDocumentsByContent(
  content: string
): Promise<{ id: string; title: string; isArchived: boolean }[]> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all documents for this user using existing getSidebar query
    const allDocs = await client.query(api.documents.getSidebar, {
      parentDocument: undefined,
    });

    // Filter by content or title
    const contentLower = content.toLowerCase();
    const filtered = allDocs.filter((doc: any) => {
      const docContentLower = (doc.content || "").toLowerCase();
      const docTitleLower = doc.title.toLowerCase();
      return docContentLower.includes(contentLower) || docTitleLower.includes(contentLower);
    });

    return filtered.map((doc: any) => ({
      id: doc._id,
      title: doc.title,
      isArchived: doc.isArchived,
    }));
  } catch (error) {
    console.error("[v0] searchDocumentsByContent error:", error);
    throw error;
  }
}

export async function listAllDocuments(): Promise<
  { id: string; title: string; isArchived: boolean }[]
> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all documents for this user using existing getSidebar query
    const allDocs = await client.query(api.documents.getSidebar, {
      parentDocument: undefined,
    });

    return allDocs.map((doc: any) => ({
      id: doc._id,
      title: doc.title,
      isArchived: doc.isArchived,
    }));
  } catch (error) {
    console.error("[v0] listAllDocuments error:", error);
    throw error;
  }
}
