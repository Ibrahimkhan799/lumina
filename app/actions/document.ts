"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

async function getAuthenticatedClient() {
    const session = await auth();
    const token = await session.getToken({ template: "convex" });

    if (!session.userId || !token) {
        throw new Error("Unauthorized");
    }

    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    client.setAuth(token);
    return client;
}

export async function deleteDocumentByTitle(title: string): Promise<string> {
    try {
        const client = await getAuthenticatedClient();
        const documentId = await client.query(api.documents.getDocumentIdByTitle, { title });

        if (documentId === null) {
            throw new Error(`Document with title "${title}" not found.`);
        }

        if (Array.isArray(documentId)) {
            const ambiguousTitles = documentId.map(doc => doc.title).join(", ");
            throw new Error(`Multiple documents found with title "${title}": ${ambiguousTitles}. Please be more specific.`);
        }

        await client.mutation(api.documents.remove, { id: documentId as Id<"documents"> });
        return `Document "${title}" deleted successfully.`;
    } catch (error: any) {
        console.error("[v0] deleteDocumentByTitle error:", error);
        throw new Error(`Failed to delete document: ${error.message}`);
    }
}

export async function renameDocumentByTitle(oldTitle: string, newTitle: string): Promise<string> {
    try {
        const client = await getAuthenticatedClient();
        const documentId = await client.query(api.documents.getDocumentIdByTitle, { title: oldTitle });

        if (documentId === null) {
            throw new Error(`Document with title "${oldTitle}" not found.`);
        }

        if (Array.isArray(documentId)) {
            const ambiguousTitles = documentId.map(doc => doc.title).join(", ");
            throw new Error(`Multiple documents found with title "${oldTitle}": ${ambiguousTitles}. Please be more specific.`);
        }

        await client.mutation(api.documents.update, { id: documentId as Id<"documents">, title: newTitle });
        return `Document "${oldTitle}" renamed to "${newTitle}" successfully.`;
    } catch (error: any) {
        console.error("[v0] renameDocumentByTitle error:", error);
        throw new Error(`Failed to rename document: ${error.message}`);
    }
}

export async function editDocumentByTitle(title: string, content: string): Promise<string> {
    try {
        const client = await getAuthenticatedClient();
        const documentId = await client.query(api.documents.getDocumentIdByTitle, { title });

        if (documentId === null) {
            throw new Error(`Document with title "${title}" not found.`);
        }

        if (Array.isArray(documentId)) {
            const ambiguousTitles = documentId.map(doc => doc.title).join(", ");
            throw new Error(`Multiple documents found with title "${title}": ${ambiguousTitles}. Please be more specific.`);
        }

        await client.mutation(api.documents.update, { id: documentId as Id<"documents">, content: content });
        return `Document "${title}" content updated successfully.`;
    } catch (error: any) {
        console.error("[v0] editDocumentByTitle error:", error);
        throw new Error(`Failed to update document content: ${error.message}`);
    }
}
