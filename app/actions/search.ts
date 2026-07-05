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
    const results = await client.query(api.documents.searchByTitle, {
      query: title,
      fuzzy: fuzzy || false,
    });

    return results.map((doc: any) => ({
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
    const results = await client.query(api.documents.searchByContent, {
      query: content,
    });

    return results.map((doc: any) => ({
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
    const results = await client.query(api.documents.listAll);

    return results.map((doc: any) => ({
      id: doc._id,
      title: doc.title,
      isArchived: doc.isArchived,
    }));
  } catch (error) {
    console.error("[v0] listAllDocuments error:", error);
    throw error;
  }
}
